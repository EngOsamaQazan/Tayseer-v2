import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByLogin(dto.login);

    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const valid = await this.usersService.validatePassword(user, dto.password);
    if (!valid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('الحساب محظور');
    }

    if (user.tenant?.status !== 'active') {
      throw new UnauthorizedException('اشتراك الشركة غير فعال');
    }

    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name,
      },
    };
  }

  async register(dto: RegisterDto) {
    const tenant = await this.tenantsService.create({
      name: dto.companyName,
      slug: dto.companySlug,
      phoneNumber: dto.companyPhone,
      plan: 'trial',
    });

    const user = await this.usersService.create(
      {
        username: dto.username,
        email: dto.email,
        password: dto.password,
        name: dto.name,
        lastName: dto.lastName,
        mobile: dto.mobile,
        role: 'admin' as any,
        gender: dto.gender,
      },
      tenant.id,
    );

    return this.login({ login: user.email, password: dto.password });
  }
}
