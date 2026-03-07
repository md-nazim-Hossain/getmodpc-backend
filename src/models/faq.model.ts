import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EnumPlatformType } from "../types";

@Entity("faqs")
export class FAQs {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({
    default: EnumPlatformType.ANDROID,
    type: "enum",
    enum: EnumPlatformType,
  })
  type: EnumPlatformType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
