import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
} from "typeorm";
import { App } from "./app.model";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  @Index({ unique: true })
  slug: string;

  @Column({ nullable: true, type: "text" })
  description: string | null;

  @Column({ nullable: true, type: "text" })
  category_icon: string | null;

  @Column({ nullable: true, type: "text" })
  category_bg_color: string | null;

  @Column({ nullable: true, type: "text" })
  category_icon_bg_color: string | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "parent_cat_id" })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @ManyToMany(() => App, (app) => app.categories)
  apps: App[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
