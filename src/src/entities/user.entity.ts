import {
  Entity,
  Column,
  Index,
  OneToMany,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuditTrail } from './audit-trail.entity';
import { Node } from './node.entity';
import { DrivingSchool } from './driving-school.entity';
import { genSaltSync, hashSync, compare } from 'bcrypt';
import { Exclude } from 'class-transformer';
import { FileInterface } from '../api/file/file.dto';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 80, name: 'first_name', nullable: false })
  firstName: string;

  @Column({ length: 80, name: 'middle_name', nullable: true })
  middleName: string;

  @Column({ length: 80, name: 'last_name', nullable: false })
  lastName: string;

  @Column({ length: 20, unique: false })
  phone: string;

  @Column({ length: 100, unique: true, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Index()
  @Column({ name: 'state_id', type: 'bigint', nullable: true })
  stateId: number;

  @Index()
  @Column({ name: 'lga_id', type: 'bigint', nullable: true })
  lgaId: number;

  @Index()
  @Column({ name: 'driving_school_id', type: 'bigint', nullable: true })
  drivingSchoolId: number;

  @Column({ name: 'role_id', nullable: true })
  roleId: number;

  @Column({ name: 'role_name', length: 60, nullable: true })
  roleName: string;

  @Index()
  @Column({ name: 'change_password_next_login', default: 0 })
  changePasswordNextLogin: number;

  @Exclude()
  @Column({ type: 'text', nullable: false })
  password: string;

  @Column({ length: 500, unique: true, nullable: true })
  device: string;

  @Column({
    type: 'timestamp',
    name: 'last_password_change',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastPasswordChange: Date;

  @Index()
  @Column({ name: 'is_active', default: 0 })
  isActive: number;

  @Column({ type: 'json', nullable: true })
  files?: FileInterface[];

  @Exclude()
  @Column({ type: 'text', name: 'access_token', nullable: true })
  public accessToken: string;

  @Column({ type: 'text', nullable: true })
  permissions: string;

  @OneToMany(() => AuditTrail, (auditTrail) => auditTrail.user, {
    eager: false,
  })
  auditTrails: Promise<AuditTrail[]>;

  @JoinColumn({ name: 'driving_school_id' })
  @ManyToOne(() => DrivingSchool, {
    eager: false,
    nullable: true,
  })
  drivingSchool: DrivingSchool;

  @ManyToOne(() => Node)
  @JoinColumn({ name: 'node_id' })
  node: Node;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    const rounds = genSaltSync(parseInt(process.env.SALT_ROUND));
    this.password = hashSync(this.password, rounds);
  }
  static async comparePasswords(attemptedPassword: string, hashedPassword: string) {
    return await compare(attemptedPassword, hashedPassword);
  }
}
