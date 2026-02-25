import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto, tenantId: string): Promise<User> {
    const existing = await this.usersRepo.findOne({
      where: [
        { email: dto.email, tenantId },
        { username: dto.username, tenantId },
      ],
    });
    if (existing) {
      throw new ConflictException('البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({ ...dto, passwordHash, tenantId });
    return this.usersRepo.save(user);
  }

  async findAll(tenantId: string, page = 1, limit = 20): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.usersRepo.findAndCount({
      where: { tenantId, isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findOne(id: number, tenantId?: string): Promise<User> {
    const where: any = { id, isDeleted: false };
    if (tenantId) where.tenantId = tenantId;
    const user = await this.usersRepo.findOne({ where });
    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    const where: any = { email, isDeleted: false };
    if (tenantId) where.tenantId = tenantId;
    return this.usersRepo.findOne({ where });
  }

  async findByUsername(username: string, tenantId?: string): Promise<User | null> {
    const where: any = { username, isDeleted: false };
    if (tenantId) where.tenantId = tenantId;
    return this.usersRepo.findOne({ where });
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: [
        { email: login, isDeleted: false },
        { username: login, isDeleted: false },
      ],
      relations: ['tenant'],
    });
  }

  async update(id: number, dto: UpdateUserDto, tenantId: string): Promise<User> {
    const user = await this.findOne(id, tenantId);
    if (dto.password) {
      (dto as any).passwordHash = await bcrypt.hash(dto.password, 10);
      delete dto.password;
    }
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async softDelete(id: number, tenantId: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    user.isDeleted = true;
    await this.usersRepo.save(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
