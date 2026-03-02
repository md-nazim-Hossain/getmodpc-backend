import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";

@Entity("testimonials")
export class Testimonial {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "varchar", length: 150 })
  designation: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "text", nullable: true })
  image_url: string | null;

  @Column({ type: "text", nullable: true })
  company_logo: string | null;

  @Column({ default: true })
  @Index()
  is_active: boolean;

  @Column({ type: "int", default: 0 })
  @Index()
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
