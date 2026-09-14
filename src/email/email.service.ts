import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { envs } from '../config/envs';

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        service: envs.MAILER_SERVICE,
        auth: {
            user: envs.MAILER_USER,
            pass: envs.MAILER_PASSWORD,
        },
    });

    async sendEmail(to: string, subject: string, template: string) {
        await this.transporter.sendMail({
            to,
            subject,
            html: template,
        });
    }
}