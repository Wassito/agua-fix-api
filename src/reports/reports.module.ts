import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from './entities/report.entity';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        EmailModule,
        TypeOrmModule.forFeature([Report]),
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}