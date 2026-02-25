import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsMessage } from './entities/sms-message.entity';
import { CreateSmsDto, BulkSmsDto } from './dto/create-sms.dto';

@Injectable()
export class SmsService {
  constructor(
    @InjectRepository(SmsMessage)
    private readonly smsRepo: Repository<SmsMessage>,
  ) {}

  async create(
    dto: CreateSmsDto,
    tenantId: string,
    createdBy: number,
  ): Promise<SmsMessage> {
    const sms = this.smsRepo.create({
      ...dto,
      tenantId,
      createdBy,
      status: 'pending',
    });
    return this.smsRepo.save(sms);
  }

  async bulkCreate(
    dto: BulkSmsDto,
    tenantId: string,
    createdBy: number,
  ): Promise<{ created: number }> {
    const messages = dto.recipients.map((r) =>
      this.smsRepo.create({
        recipientNumber: r.recipientNumber,
        recipientName: r.recipientName,
        customerId: r.customerId,
        message: dto.message,
        type: dto.type,
        tenantId,
        createdBy,
        status: 'pending',
      }),
    );
    await this.smsRepo.save(messages);
    return { created: messages.length };
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    status?: string,
    type?: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<{ data: SmsMessage[]; total: number }> {
    const qb = this.smsRepo
      .createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.isDeleted = false');

    if (status) qb.andWhere('s.status = :status', { status });
    if (type) qb.andWhere('s.type = :type', { type });
    if (dateFrom) qb.andWhere('s.createdAt >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('s.createdAt <= :dateTo', { dateTo });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('s.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<SmsMessage> {
    const sms = await this.smsRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!sms) throw new NotFoundException('الرسالة غير موجودة');
    return sms;
  }

  async updateStatus(
    id: number,
    tenantId: string,
    status: string,
    providerResponse?: string,
  ): Promise<SmsMessage> {
    const sms = await this.findOne(id, tenantId);
    sms.status = status;
    if (status === 'sent') sms.sentAt = new Date();
    if (status === 'delivered') sms.deliveredAt = new Date();
    if (providerResponse) sms.providerResponse = providerResponse;
    return this.smsRepo.save(sms);
  }

  async getStats(
    tenantId: string,
  ): Promise<{ total: number; sent: number; failed: number; pending: number }> {
    const total = await this.smsRepo.count({
      where: { tenantId, isDeleted: false },
    });
    const sent = await this.smsRepo.count({
      where: { tenantId, status: 'sent', isDeleted: false },
    });
    const failed = await this.smsRepo.count({
      where: { tenantId, status: 'failed', isDeleted: false },
    });
    const pending = await this.smsRepo.count({
      where: { tenantId, status: 'pending', isDeleted: false },
    });
    return { total, sent, failed, pending };
  }

  async resend(id: number, tenantId: string): Promise<SmsMessage> {
    const sms = await this.findOne(id, tenantId);
    sms.status = 'pending';
    sms.errorMessage = '';
    return this.smsRepo.save(sms);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const sms = await this.findOne(id, tenantId);
    sms.isDeleted = true;
    await this.smsRepo.save(sms);
  }
}
