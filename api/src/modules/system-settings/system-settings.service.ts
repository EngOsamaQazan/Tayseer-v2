import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
  ) {}

  async findAll(tenantId: string, category?: string) {
    const where: any = { tenantId, isDeleted: false };
    if (category) where.category = category;

    return this.settingRepo.find({
      where,
      order: { category: 'ASC', key: 'ASC' },
    });
  }

  async findByKey(tenantId: string, key: string) {
    const setting = await this.settingRepo.findOne({
      where: { tenantId, key, isDeleted: false },
    });
    if (!setting) {
      throw new NotFoundException(`الإعداد '${key}' غير موجود`);
    }
    return setting;
  }

  async create(dto: CreateSystemSettingDto, tenantId: string) {
    const existing = await this.settingRepo.findOne({
      where: { tenantId, key: dto.key, isDeleted: false },
    });
    if (existing) {
      throw new ConflictException(`الإعداد '${dto.key}' موجود مسبقاً`);
    }

    const setting = this.settingRepo.create({
      ...dto,
      tenantId,
    });
    return this.settingRepo.save(setting);
  }

  async update(id: number, dto: UpdateSystemSettingDto, tenantId: string) {
    const setting = await this.settingRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!setting) {
      throw new NotFoundException('الإعداد غير موجود');
    }

    Object.assign(setting, dto);
    return this.settingRepo.save(setting);
  }

  async upsert(dto: CreateSystemSettingDto, tenantId: string) {
    let setting = await this.settingRepo.findOne({
      where: { tenantId, key: dto.key, isDeleted: false },
    });

    if (setting) {
      setting.value = dto.value;
      if (dto.label) setting.label = dto.label;
      if (dto.description) setting.description = dto.description;
      return this.settingRepo.save(setting);
    }

    setting = this.settingRepo.create({ ...dto, tenantId });
    return this.settingRepo.save(setting);
  }

  async remove(id: number, tenantId: string) {
    const setting = await this.settingRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!setting) {
      throw new NotFoundException('الإعداد غير موجود');
    }

    setting.isDeleted = true;
    return this.settingRepo.save(setting);
  }

  async seed(tenantId: string) {
    const defaults: Partial<CreateSystemSettingDto>[] = [
      {
        key: 'company_name',
        value: '',
        category: 'general',
        label: 'اسم الشركة',
        valueType: 'string',
      },
      {
        key: 'company_phone',
        value: '',
        category: 'general',
        label: 'رقم هاتف الشركة',
        valueType: 'string',
      },
      {
        key: 'company_email',
        value: '',
        category: 'general',
        label: 'البريد الإلكتروني',
        valueType: 'string',
      },
      {
        key: 'company_address',
        value: '',
        category: 'general',
        label: 'عنوان الشركة',
        valueType: 'string',
      },
      {
        key: 'currency',
        value: 'JOD',
        category: 'financial',
        label: 'العملة الافتراضية',
        valueType: 'string',
      },
      {
        key: 'tax_rate',
        value: '16',
        category: 'financial',
        label: 'نسبة الضريبة %',
        valueType: 'number',
      },
      {
        key: 'late_fee_rate',
        value: '2',
        category: 'financial',
        label: 'نسبة غرامة التأخير %',
        valueType: 'number',
      },
      {
        key: 'grace_period_days',
        value: '3',
        category: 'contracts',
        label: 'أيام السماح قبل الغرامة',
        valueType: 'number',
      },
      {
        key: 'default_installment_count',
        value: '12',
        category: 'contracts',
        label: 'عدد الأقساط الافتراضي',
        valueType: 'number',
      },
      {
        key: 'sms_enabled',
        value: 'false',
        category: 'notifications',
        label: 'تفعيل الرسائل القصيرة',
        valueType: 'boolean',
      },
      {
        key: 'sms_provider',
        value: '',
        category: 'notifications',
        label: 'مزود خدمة الرسائل',
        valueType: 'string',
      },
      {
        key: 'date_format',
        value: 'DD/MM/YYYY',
        category: 'display',
        label: 'صيغة التاريخ',
        valueType: 'string',
      },
      {
        key: 'language',
        value: 'ar',
        category: 'display',
        label: 'اللغة الافتراضية',
        valueType: 'string',
      },
      {
        key: 'rows_per_page',
        value: '20',
        category: 'display',
        label: 'عدد السجلات في الصفحة',
        valueType: 'number',
      },
    ];

    let created = 0;
    for (const def of defaults) {
      const exists = await this.settingRepo.findOne({
        where: { tenantId, key: def.key, isDeleted: false },
      });
      if (!exists) {
        await this.settingRepo.save(
          this.settingRepo.create({ ...def, tenantId }),
        );
        created++;
      }
    }

    return { created };
  }
}
