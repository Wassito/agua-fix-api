import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: CreateUserDto) {
        return await this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto);
    }
}