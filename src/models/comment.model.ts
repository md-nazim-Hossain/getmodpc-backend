import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn()
  id: string;

  @Column("text")
  content: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  parent: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @Column({ default: 0 })
  is_edited: boolean;

  @Column({ nullable: true, type: "timestamp" })
  last_edited_at: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
