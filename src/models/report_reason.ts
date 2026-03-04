import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from "typeorm";
import { Report } from "./report";

@Entity("report_reasons")
export class ReportReason {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  @Index({ unique: true })
  title: string;

  @Column({
    type: "boolean",
    default: true,
  })
  is_active: boolean;

  @OneToMany(() => Report, (report) => report.reason)
  reports: Report[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
