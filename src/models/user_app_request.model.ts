import {
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EnumUserAppRequestStatus } from "../types";

@Entity("user_app_requests")
export class UserAppRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  app_name: string;

  @Column()
  app_url: string;

  @Column({
    type: "enum",
    enum: EnumUserAppRequestStatus,
    default: EnumUserAppRequestStatus.PENDING,
  })
  status: EnumUserAppRequestStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
