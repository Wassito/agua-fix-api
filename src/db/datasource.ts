import { envs } from '../config/envs';
import { User } from '../users/entities/user.entity';
import * as ReportModule from '../reports/entities/report.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

const Report = 'Report' in ReportModule ? ReportModule.Report : (ReportModule as any).default;

export const dataSourceOptions: DataSourceOptions = {
    host: envs.DB_HOST,
    type: 'postgres',
    port: envs.DB_PORT,
    database: envs.DB_NAME,
    username: envs.DB_USER,
    password: envs.DB_PASSWORD,
    entities: [
        User,
        Report,
    ],
    synchronize: true,
    migrations: ['dist/db/migrations/[0-9]*-*.js'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;