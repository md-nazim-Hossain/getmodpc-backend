import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
} from "typeorm";
import { App } from "./app.model";

@Entity("tags")
export class Tag {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  @Index({ unique: true })
  slug: string;

  @Column({ nullable: true, type: "text" })
  description: string | null;

  @ManyToMany(() => App, (app) => app.tags)
  apps: App[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
