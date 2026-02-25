import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollRun } from './entities/payroll-run.entity';
import {
  CreatePayrollRunDto,
  UpdatePayrollRunDto,
} from './dto/create-payroll-run.dto';
import { Employee } from './entities/employee.entity';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollRun)
    private readonly payrollRepo: Repository<PayrollRun>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(
    dto: CreatePayrollRunDto,
    tenantId: string,
    createdBy: number,
  ): Promise<PayrollRun> {
    const existing = await this.payrollRepo.findOne({
      where: { tenantId, period: dto.period, isDeleted: false },
    });
    if (existing) {
      throw new ConflictException('مسير رواتب لهذه الفترة موجود بالفعل');
    }

    const employees = await this.employeeRepo.find({
      where: { tenantId, isDeleted: false, status: 'active' },
    });

    const payslips = employees.map((emp) => ({
      employeeId: emp.id,
      userId: emp.userId,
      employeeCode: emp.employeeCode,
      basicSalary: emp.basicSalary || 0,
      salaryComponents: emp.salaryComponents || [],
      totalEarnings: emp.basicSalary || 0,
      totalDeductions: 0,
      netSalary: emp.basicSalary || 0,
    }));

    const totalGross = payslips.reduce((s, p) => s + +p.totalEarnings, 0);
    const totalDeductions = payslips.reduce(
      (s, p) => s + +p.totalDeductions,
      0,
    );
    const totalNet = payslips.reduce((s, p) => s + +p.netSalary, 0);

    const run = this.payrollRepo.create({
      ...dto,
      tenantId,
      createdBy,
      payslips,
      totals: {
        totalEmployees: employees.length,
        totalGross,
        totalDeductions,
        totalNet,
      },
    });

    return this.payrollRepo.save(run);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: PayrollRun[]; total: number }> {
    const [data, total] = await this.payrollRepo.findAndCount({
      where: { tenantId, isDeleted: false },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<PayrollRun> {
    const run = await this.payrollRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!run) throw new NotFoundException('مسير الرواتب غير موجود');
    return run;
  }

  async update(
    id: number,
    dto: UpdatePayrollRunDto,
    tenantId: string,
  ): Promise<PayrollRun> {
    const run = await this.findOne(id, tenantId);
    if (run.status === 'locked' || run.status === 'posted') {
      throw new BadRequestException('لا يمكن تعديل مسير رواتب مقفل أو مرحّل');
    }
    Object.assign(run, dto);
    return this.payrollRepo.save(run);
  }

  async approve(
    id: number,
    tenantId: string,
    approvedBy: number,
  ): Promise<PayrollRun> {
    const run = await this.findOne(id, tenantId);
    if (run.status !== 'draft' && run.status !== 'preview') {
      throw new BadRequestException('لا يمكن اعتماد هذا المسير');
    }
    run.status = 'approved';
    run.approvedBy = approvedBy;
    run.approvedAt = new Date();
    return this.payrollRepo.save(run);
  }

  async lock(id: number, tenantId: string): Promise<PayrollRun> {
    const run = await this.findOne(id, tenantId);
    if (run.status !== 'approved') {
      throw new BadRequestException('يجب اعتماد المسير أولاً قبل القفل');
    }
    run.status = 'locked';
    return this.payrollRepo.save(run);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const run = await this.findOne(id, tenantId);
    if (run.status === 'locked' || run.status === 'posted') {
      throw new BadRequestException('لا يمكن حذف مسير رواتب مقفل أو مرحّل');
    }
    run.isDeleted = true;
    await this.payrollRepo.save(run);
  }
}
