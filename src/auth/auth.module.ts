import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { envs } from '../config/envs';
import type { StringValue } from 'ms';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: envs.JWT_SECRET,
            signOptions: { expiresIn: envs.JWT_EXPIRATION as StringValue },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}