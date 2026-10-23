import { BadRequestException, Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';
import type { UploadFile } from '../storage/storage.service';
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
        private storageService: StorageService,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('photo', {
        limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (_req, file, cb) => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
                return cb(new BadRequestException('Usa una foto JPEG, PNG o WebP'), false);
            }
            cb(null, true);
        },
    }))
    async createReport(@Body() dto: CreateReportDto, @UploadedFile() photo?: UploadFile) {
        if (!photo?.buffer?.length) throw new BadRequestException('La foto es obligatoria (campo photo)');
        for (const field of ['address', 'description', 'severity', 'reporterPhone'] as const) {
            if (typeof dto[field] !== 'string' || !dto[field].trim()) {
                throw new BadRequestException(`El campo ${field} es obligatorio`);
            }
        }
        const photoUrl = await this.storageService.uploadFile(photo, 'reports');
        const report = await this.reportsService.createReport(dto, photoUrl);

        const template = generateReportTemplate(dto, photoUrl);
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
