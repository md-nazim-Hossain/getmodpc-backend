import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { App } from "./app.model";

@Entity()
export class Rating {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index(["ip","rating_at"])
  @Column()
  ip: string;

  @ManyToOne(() => App, (app) => app.ratings)
  app: App;

  @Column({ type: "timestamp" })
  rating_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}