import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    private buildToken(id: number, email: string): string {
        const payload: JwtPayload = { sub: id, email };
        return this.jwtService.sign(payload);
    }

    async register(dto: CreateUserDto) {
        const id = await this.usersService.create(dto);
        const token = this.buildToken(id, dto.email);
        return { id, token };
    }

    async login(dto: LoginDto) {
        const result = await this.usersService.validate(dto.email, dto.password);
        if (!result) throw new BadRequestException('El email o la contraseña no es valido');

        const token = this.buildToken(result.id, result.email);
        return { id: result.id, token };
    }

    async validate(email: string, password: string): Promise<{ id: number; email: string } | null> {
        const user = await this.usersService.validate(email, password);
        if (!user) return null;

        return { id: user.id, email: user.email };
    }
}