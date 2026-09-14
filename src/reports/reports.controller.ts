import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { EmailService } from '../email/email.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { generateReportTemplate } from './templates/report.template';
import { envs } from '../config/envs';

@Controller('reports')
export class ReportsController {
    constructor(
        private reportsService: ReportsService,
        private emailService: EmailService,
    ) {}

    @Post()
    async createReport(@Body() dto: CreateReportDto) {
        const report = await this.reportsService.createReport(dto);

        const template = generateReportTemplate(dto);
        await this.emailService.sendEmail(
            envs.CREW_EMAIL,
            `Nueva fuga reportada: ${dto.address}`,
            template,
        );

        return report;
    }

    @Get()
    async findAll() {
        return await this.reportsService.findAll();
    }
}