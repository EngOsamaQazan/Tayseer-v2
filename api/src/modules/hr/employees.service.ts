import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(
    dto: CreateEmployeeDto,
    tenantId: string,
    createdBy: number,
  ): Promise<Employee> {
    const existing = await this.employeeRepo.findOne({
      where: { tenantId, userId: dto.userId, isDeleted: false },
    });
    if (existing) {
      throw new ConflictException('هذا المستخدم مسجل كموظف بالفعل');
    }

    const employee = this.employeeRepo.create({
      ...dto,
      tenantId,
      createdBy,
      status: dto.status || 'active',
    });
    return this.employeeRepo.save(employee);
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 20,
    search?: string,
    department?: string,
    status?: string,
  ): Promise<{ data: Employee[]; total: number }> {
    const qb = this.employeeRepo
      .createQueryBuilder('e')
      .where('e.tenantId = :tenantId', { tenantId })
      .andWhere('e.isDeleted = false');

    if (search) {
      qb.andWhere(
        '(e.employeeCode ILIKE :search OR e.department ILIKE :search OR e.position ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (department) {
      qb.andWhere('e.department = :department', { department });
    }
    if (status) {
      qb.andWhere('e.status = :status', { status });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('e.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findOne(id: number, tenantId: string): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { id, tenantId, isDeleted: false },
    });
    if (!employee) throw new NotFoundException('الموظف غير موجود');
    return employee;
  }

  async findByUserId(userId: number, tenantId: string): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { userId, tenantId, isDeleted: false },
    });
    if (!employee) throw new NotFoundException('الموظف غير موجود');
    return employee;
  }

  async update(
    id: number,
    dto: Partial<CreateEmployeeDto>,
    tenantId: string,
  ): Promise<Employee> {
    const employee = await this.findOne(id, tenantId);
    Object.assign(employee, dto);
    return this.employeeRepo.save(employee);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const employee = await this.findOne(id, tenantId);
    employee.isDeleted = true;
    await this.employeeRepo.save(employee);
  }

  async getStats(
    tenantId: string,
  ): Promise<{ total: number; active: number; fieldStaff: number }> {
    const total = await this.employeeRepo.count({
      where: { tenantId, isDeleted: false },
    });
    const active = await this.employeeRepo.count({
      where: { tenantId, isDeleted: false, status: 'active' },
    });
    const fieldStaff = await this.employeeRepo.count({
      where: { tenantId, isDeleted: false, isFieldStaff: true },
    });
    return { total, active, fieldStaff };
  }
}
