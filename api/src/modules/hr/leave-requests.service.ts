import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
  ) {}

  async create(
    dto: CreateLeaveRequestDto,
    tenantId: string,
    userId: number,
  ): Promise<LeaveRequest> {
    const request = this.leaveRepo.create({
      ...dto,
      tenantId,
      userId,
      createdBy: userId,
      status: 'pending',
    });
    return this.leaveRepo.save(request);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    userId?: number,
    status?: string,
  ): Promise<{ data: LeaveRequest[]; total: number }> {
    const qb = this.leaveRepo
      .createQueryBuilder('lr')
      .where('lr.tenantId = :tenantId', { tenantId })
      .andWhere('lr.isDeleted = false');

    if (userId) qb.andWhere('lr.userId = :userId', { userId });
    if (status) qb.andWhere('lr.status = :status', { status });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('lr.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<LeaveRequest> {
    const request = await this.leaveRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!request) throw new NotFoundException('طلب الإجازة غير موجود');
    return request;
  }

  async approve(
    id: number,
    tenantId: string,
    approvedBy: number,
  ): Promise<LeaveRequest> {
    const request = await this.findOne(id, tenantId);
    if (request.status !== 'pending') {
      throw new BadRequestException('لا يمكن اعتماد هذا الطلب');
    }
    request.status = 'approved';
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();
    return this.leaveRepo.save(request);
  }

  async reject(
    id: number,
    tenantId: string,
    approvedBy: number,
    rejectionReason: string,
  ): Promise<LeaveRequest> {
    const request = await this.findOne(id, tenantId);
    if (request.status !== 'pending') {
      throw new BadRequestException('لا يمكن رفض هذا الطلب');
    }
    request.status = 'rejected';
    request.approvedBy = approvedBy;
    request.rejectionReason = rejectionReason;
    return this.leaveRepo.save(request);
  }

  async cancel(
    id: number,
    tenantId: string,
    userId: number,
  ): Promise<LeaveRequest> {
    const request = await this.findOne(id, tenantId);
    if (request.userId !== userId) {
      throw new BadRequestException('لا يمكنك إلغاء طلب غير تابع لك');
    }
    if (request.status !== 'pending') {
      throw new BadRequestException('لا يمكن إلغاء هذا الطلب');
    }
    request.status = 'cancelled';
    return this.leaveRepo.save(request);
  }

  async getMyRequests(
    tenantId: string,
    userId: number,
  ): Promise<LeaveRequest[]> {
    return this.leaveRepo.find({
      where: { tenantId, userId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const request = await this.findOne(id, tenantId);
    request.isDeleted = true;
    await this.leaveRepo.save(request);
  }
}
