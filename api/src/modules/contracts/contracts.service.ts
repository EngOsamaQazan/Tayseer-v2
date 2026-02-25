import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus, ContractInstallment, InstallmentStatus } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(ContractInstallment)
    private readonly installmentRepo: Repository<ContractInstallment>,
  ) {}

  async create(dto: CreateContractDto, tenantId: string, userId: number) {
    const exists = await this.contractRepo.findOne({
      where: { tenantId, contractNumber: dto.contractNumber, isDeleted: false },
    });
    if (exists) throw new ConflictException('رقم العقد موجود مسبقاً');

    const contract = this.contractRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });
    const saved = await this.contractRepo.save(contract);

    if (dto.installmentCount > 0 && dto.firstInstallmentDate) {
      const installments: Partial<ContractInstallment>[] = [];
      const startDate = new Date(dto.firstInstallmentDate);

      for (let i = 0; i < dto.installmentCount; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        installments.push({
          tenantId,
          contractId: saved.id,
          installmentNumber: i + 1,
          amount: dto.installmentAmount,
          paidAmount: 0,
          dueDate: dueDate.toISOString().split('T')[0],
          status: InstallmentStatus.PENDING,
        });
      }
      await this.installmentRepo.save(installments);
    }

    return this.findOne(saved.id, tenantId);
  }

  async findAll(tenantId: string, page = 1, limit = 20, status?: ContractStatus, search?: string) {
    const qb = this.contractRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.customer', 'cust')
      .leftJoinAndSelect('c.company', 'comp')
      .where('c.tenantId = :tenantId', { tenantId })
      .andWhere('c.isDeleted = false');

    if (status) qb.andWhere('c.status = :status', { status });
    if (search) {
      qb.andWhere('(c.contractNumber ILIKE :s OR cust.name ILIKE :s)', { s: `%${search}%` });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('c.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number, tenantId: string) {
    const contract = await this.contractRepo.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['customer', 'company', 'installments'],
    });
    if (!contract) throw new NotFoundException('العقد غير موجود');
    if (contract.installments) {
      contract.installments = contract.installments
        .filter((i) => !i.isDeleted)
        .sort((a, b) => a.installmentNumber - b.installmentNumber);
    }
    return contract;
  }

  async update(id: number, dto: Partial<CreateContractDto>, tenantId: string) {
    const contract = await this.findOne(id, tenantId);
    Object.assign(contract, dto);
    return this.contractRepo.save(contract);
  }

  async remove(id: number, tenantId: string) {
    const contract = await this.findOne(id, tenantId);
    contract.isDeleted = true;
    return this.contractRepo.save(contract);
  }

  async payInstallment(installmentId: number, amount: number, tenantId: string) {
    const inst = await this.installmentRepo.findOne({
      where: { id: installmentId, tenantId, isDeleted: false },
    });
    if (!inst) throw new NotFoundException('القسط غير موجود');

    inst.paidAmount = Number(inst.paidAmount) + amount;
    inst.paidDate = new Date().toISOString().split('T')[0];
    inst.status =
      inst.paidAmount >= Number(inst.amount)
        ? InstallmentStatus.PAID
        : InstallmentStatus.PARTIAL;

    return this.installmentRepo.save(inst);
  }
}
