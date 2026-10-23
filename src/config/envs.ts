import * as env from 'env-var';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const envs = {
    AWS_REGION: env.get('AWS_REGION').required().asString(),
    S3_BUCKET: env.get('S3_BUCKET').required().asString(),
    MAILER_SERVICE: env.get('MAILER_SERVICE').required().asString(),
    MAILER_USER: env.get('MAILER_USER').required().asString(),
    MAILER_PASSWORD: env.get('MAILER_PASSWORD').required().asString(),
    CREW_EMAIL: env.get('CREW_EMAIL').required().asString(),
    DB_PASSWORD: env.get('DB_PASSWORD').required().asString(),
    DB_NAME: env.get('DB_NAME').required().asString(),
    DB_USER: env.get('DB_USER').required().asString(),
    DB_HOST: env.get('DB_HOST').required().asString(),
    DB_PORT: env.get('DB_PORT').required().asPortNumber(),
    DB_TYPE: env.get('DB_TYPE').required().asString(),
    JWT_SECRET: env.get('JWT_SECRET').required().asString(),
    JWT_EXPIRATION: env.get('JWT_EXPIRATION').required().asString(),
};
