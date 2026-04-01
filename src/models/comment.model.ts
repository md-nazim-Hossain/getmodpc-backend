import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { App } from "./app.model";

@Entity("comments")
@Index(["app_id", "email", "name"])
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  content: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  parent_id: string | null;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "parent_id" })
  parent: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @Column()
  app_id: string;

  @ManyToOne(() => App, (app) => app.comments, {
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
