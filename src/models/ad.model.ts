import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EnumMediaType } from "../types";

@Entity("ads")
export class Ad {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  media_url: string;

  @Column({ type: "enum", enum: EnumMediaType, default: EnumMediaType.IMAGE })
  media_type: EnumMediaType;

  @Column()
  cta_url: string;

  @Column({ nullable: true })
  cta_label: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "timestamp" })
  start_at: Date;

  @Column({ type: "timestamp" })
  end_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
