import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, Attendance, PayrollRun } from './entities/hr.entity';
import { CreateEmployeeDto, CreateAttendanceDto } from './dto/hr.dto';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(Employee) private readonly empRepo: Repository<Employee>,
    @InjectRepository(Attendance) private readonly attRepo: Repository<Attendance>,
    @InjectRepository(PayrollRun) private readonly payRepo: Repository<PayrollRun>,
  ) {}

  async createEmployee(dto: CreateEmployeeDto, tenantId: string) {
    const exists = await this.empRepo.findOne({ where: { tenantId, employeeNumber: dto.employeeNumber, isDeleted: false } });
    if (exists) throw new ConflictException('رقم الموظف موجود مسبقاً');
    return this.empRepo.save(this.empRepo.create({ ...dto, tenantId }));
  }

  async findAllEmployees(tenantId: string, page = 1, limit = 20) {
    const [data, total] = await this.empRepo.findAndCount({
      where: { tenantId, isDeleted: false }, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneEmployee(id: number, tenantId: string) {
    const e = await this.empRepo.findOne({ where: { id, tenantId, isDeleted: false } });
    if (!e) throw new NotFoundException('الموظف غير موجود');
    return e;
  }

  async updateEmployee(id: number, dto: Partial<CreateEmployeeDto>, tenantId: string) {
    const e = await this.findOneEmployee(id, tenantId);
    Object.assign(e, dto);
    return this.empRepo.save(e);
  }

  async removeEmployee(id: number, tenantId: string) {
    const e = await this.findOneEmployee(id, tenantId);
    e.isDeleted = true;
    return this.empRepo.save(e);
  }

  async recordAttendance(dto: CreateAttendanceDto, tenantId: string) {
    return this.attRepo.save(this.attRepo.create({ ...dto, tenantId }));
  }

  async getAttendance(tenantId: string, employeeId?: number, date?: string) {
    const qb = this.attRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.employee', 'emp')
      .where('a.tenantId = :tenantId', { tenantId })
      .andWhere('a.isDeleted = false');
    if (employeeId) qb.andWhere('a.employeeId = :employeeId', { employeeId });
    if (date) qb.andWhere('a.date = :date', { date });
    return qb.orderBy('a.date', 'DESC').limit(100).getMany();
  }

  async runPayroll(month: string, tenantId: string, userId: number) {
    const employees = await this.empRepo.find({ where: { tenantId, isDeleted: false, isActive: true } });
    const details = employees.map(e => ({
      employeeId: e.id, employeeName: e.name,
      salary: Number(e.salary), deductions: 0, net: Number(e.salary),
    }));
    const totalSalaries = details.reduce((s, d) => s + d.salary, 0);
    const run = this.payRepo.create({
      tenantId, month, totalSalaries, totalDeductions: 0, totalNet: totalSalaries,
      details, status: 'draft', createdBy: userId,
    });
    return this.payRepo.save(run);
  }

  async getPayrollRuns(tenantId: string) {
    return this.payRepo.find({
      where: { tenantId, isDeleted: false }, order: { month: 'DESC' }, take: 50,
    });
  }
}
