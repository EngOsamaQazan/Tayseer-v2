import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  async create(
    dto: CreateAttendanceDto,
    tenantId: string,
    createdBy: number,
  ): Promise<Attendance> {
    const existing = await this.attendanceRepo.findOne({
      where: { tenantId, userId: dto.userId, date: dto.date, isDeleted: false },
    });
    if (existing) {
      throw new ConflictException('سجل حضور موجود لهذا التاريخ');
    }

    const record = this.attendanceRepo.create({
      ...dto,
      tenantId,
      createdBy,
    });
    return this.attendanceRepo.save(record);
  }

  async clockIn(
    userId: number,
    tenantId: string,
    location?: Record<string, any>,
    notes?: string,
  ): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];

    let record = await this.attendanceRepo.findOne({
      where: { tenantId, userId, date: today, isDeleted: false },
    });

    if (record && record.checkIn) {
      throw new ConflictException('تم تسجيل الحضور مسبقاً لهذا اليوم');
    }

    if (!record) {
      record = this.attendanceRepo.create({
        tenantId,
        userId,
        date: today,
        status: 'present',
        createdBy: userId,
      });
    }

    record.checkIn = new Date();
    if (location) record.location = location;
    if (notes) record.notes = notes;
    record.status = 'present';

    return this.attendanceRepo.save(record);
  }

  async clockOut(
    userId: number,
    tenantId: string,
    location?: Record<string, any>,
    notes?: string,
  ): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];

    const record = await this.attendanceRepo.findOne({
      where: { tenantId, userId, date: today, isDeleted: false },
    });

    if (!record || !record.checkIn) {
      throw new NotFoundException('لم يتم تسجيل الحضور لهذا اليوم');
    }

    record.checkOut = new Date();
    if (location) {
      record.location = { ...record.location, checkOut: location };
    }
    if (notes) {
      record.notes = record.notes ? `${record.notes}\n${notes}` : notes;
    }

    return this.attendanceRepo.save(record);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    userId?: number,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ data: Attendance[]; total: number }> {
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.isDeleted = false');

    if (userId) qb.andWhere('a.userId = :userId', { userId });
    if (dateFrom) qb.andWhere('a.date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('a.date <= :dateTo', { dateTo });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('a.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Attendance> {
    const record = await this.attendanceRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!record) throw new NotFoundException('سجل الحضور غير موجود');
    return record;
  }

  async getSummary(
    tenantId: string,
    userId: number,
    month: string,
  ): Promise<{
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalOvertime: number;
  }> {
    const [year, m] = month.split('-');
    const dateFrom = `${year}-${m}-01`;
    const dateTo = `${year}-${m}-31`;

    const records = await this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.userId = :userId', { userId })
      .andWhere('a.date >= :dateFrom', { dateFrom })
      .andWhere('a.date <= :dateTo', { dateTo })
      .andWhere('a.isDeleted = false')
      .getMany();

    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let totalOvertime = 0;

    for (const r of records) {
      if (r.status === 'present') presentDays++;
      else if (r.status === 'absent') absentDays++;
      else if (r.status === 'late') {
        lateDays++;
        presentDays++;
      }
      totalOvertime += r.overtimeMinutes || 0;
    }

    return { presentDays, absentDays, lateDays, totalOvertime };
  }
}
