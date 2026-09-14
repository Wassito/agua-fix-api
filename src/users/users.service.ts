import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(dto: CreateUserDto): Promise<number> {
        const exists = await this.userRepository.findOneBy({ email: dto.email });
        if (exists) throw new ConflictException('El email ya esta registrado');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = this.userRepository.create({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            isNotificationEnabled: dto.isNotificationEnabled,
        });

        const saved = await this.userRepository.save(user);
        return saved.id;
    }

    async validate(email: string, password: string): Promise<{ id: number; email: string } | null> {
        const exists = await this.userRepository.findOneBy({ email });
        if (!exists) return null;

        const isValid = await bcrypt.compare(password, exists.password);
        if (!isValid) return null;

        return { id: exists.id, email: exists.email };
    }
}