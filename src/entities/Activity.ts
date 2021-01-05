import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
} from "typeorm";
import User from "./User";

@Entity()
export default class Activity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("bigint")
  timestamp!: number;

  @Column("text", { nullable: true })
  language!: string | null;

  @Column("text", { nullable: true })
  filename!: string | null;

  @Column("text", { nullable: true })
  workspaceName!: string | null;

  @Column("text", { nullable: true })
  customMessage!: string | null;

  @OneToOne(() => User, (user) => user.activity)
  owner!: User;
}
