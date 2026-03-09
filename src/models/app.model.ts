import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  EnumAppCommentStatus,
  EnumAppStatus,
  EnumAppType,
  EnumPlatformType,
} from "../types";
import { Category } from "./category.model";
import { Tag } from "./tag.model";
import { AppLink } from "./app_link.model";

@Entity("apps")
export class App {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    type: "enum",
    enum: EnumPlatformType,
    nullable: true,
  })
  platform: EnumPlatformType | null;

  @Column({
    type: "enum",
    enum: EnumAppType,
    nullable: true,
  })
  type: EnumAppType | null;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text", nullable: true })
  summary: string | null;

  @Column({ type: "text", nullable: true })
  latest_news: string | null;

  @Column({ type: "text", nullable: true })
  header_image: string | null;

  @Column({ type: "text", nullable: true })
  icon: string | null;

  @Column({ type: "text", nullable: true })
  genre: string | null;

  @Column({ type: "text", nullable: true })
  youtube_id: string | null;

  @Column()
  os_version: string;

  @Column("text", { array: true, default: [] })
  screenshots: string[];

  @Column("text", { array: true, default: [] })
  app_developers: string[];

  @Column("text", { array: true, default: [] })
  app_tags: string[];

  @Column({ type: "text", nullable: true })
  version: string | null;

  @Column({ type: "text", nullable: true })
  latest_version: string | null;

  @Column({ type: "boolean", default: false })
  show_in_slider: boolean;

  @Column({ type: "text", nullable: true })
  size: string | null;

  @Column({ type: "boolean", default: false })
  is_verified: boolean;

  @Column({ type: "text", nullable: true })
  updated: string | null;

  @Column({ type: "text", nullable: true })
  short_mode: string | null;

  @Column({ type: "enum", enum: EnumAppStatus, default: EnumAppStatus.DRAFT })
  status: EnumAppStatus;

  @Column({
    type: "enum",
    enum: EnumAppCommentStatus,
    default: EnumAppCommentStatus.OPEN,
  })
  comment_status: EnumAppCommentStatus;

  @ManyToMany(() => Category, (category) => category.apps)
  @JoinTable({
    name: "app_categories",
    joinColumn: { name: "app_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  categories: Category[];

  @ManyToMany(() => Tag, (tag) => tag.apps)
  @JoinTable({
    name: "app_tags",
    joinColumn: { name: "app_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags: Tag[];

  @Column()
  url: string;

  @Column({ type: "text" })
  package_name: string;

  @Column()
  installs: string;

  @Column()
  score_text: string;

  @Column({ type: "int", default: 0 })
  ratings: number;

  @Column({ type: "int", default: 0 })
  reviews: number;

  @Column({ type: "timestamp", nullable: true })
  published_date: Date | null;

  @OneToMany(() => AppLink, (appLink) => appLink.app)
  links: AppLink[];

  @Column({ type: "jsonb", default: [] })
  modders: {
    title: string | null;
    descriptions: string | null;
  }[];

  @Column({ type: "timestamp", nullable: true })
  last_version_checked_at: Date | null;

  @Column({ type: "boolean", default: false })
  is_deleted: boolean;

  @Column({ type: "timestamp", nullable: true })
  deleted_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
