import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('SYSTEM_USER')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column()
    isNotificationEnabled!: boolean;
}