import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ReportReason } from "./report_reason";
import { EnumReportStatus } from "../types";

@Entity("reports")
export class Report {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  email: string;

  @ManyToOne(() => ReportReason, (reason) => reason.reports, {
    eager: true,
  })
  @JoinColumn({ name: "reason_id" })
  reason: ReportReason;

  @Column({ type: "text", nullable: true })
  details: string | null;

  @Column({
    type: "enum",
    enum: EnumReportStatus,
    default: EnumReportStatus.OPEN,
  })
  status: EnumReportStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
