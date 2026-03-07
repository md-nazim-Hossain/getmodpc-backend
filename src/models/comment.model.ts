import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";
import { App } from "./app.model";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  content: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  parent: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @ManyToOne(() => App, (app) => app.links, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "app_id" })
  app: App;

  @Column({ default: 0 })
  is_edited: boolean;

  @Column({ nullable: true, type: "timestamp" })
  last_edited_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
