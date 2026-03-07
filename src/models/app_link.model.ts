import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { App } from "./app.model";

@Entity("app_links")
export class AppLink {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  type: string | null;

  @Column({ type: "text", nullable: true })
  size: string | null;

  @Column()
  link: string;

  @Column({ type: "text", nullable: true })
  note: string | null;

  @ManyToOne(() => App, (app) => app.links, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "app_id" })
  app: App;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
