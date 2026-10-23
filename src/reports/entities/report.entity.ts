import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('WATER_REPORT')
export class Report {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    address!: string;

    @Column()
    description!: string;

    @Column()
    severity!: string; // 'low' | 'medium' | 'high'

    @Column()
    reporterPhone!: string;

    // Los reportes del primer parcial no tienen fotografia.
    @Column({ type: 'varchar', nullable: true })
    photoUrl!: string | null;

    @Column({ type: 'varchar', nullable: true })
    repairPhotoUrl!: string | null;

    @Column({ default: false })
    isResolved!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
