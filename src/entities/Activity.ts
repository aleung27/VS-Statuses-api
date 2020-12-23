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
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("bigint")
  timestamp!: number;

  @Column("text")
  language!: string;

  @Column("text")
  filename!: string;

  @Column("text")
  workspaceName!: string;

  @Column("text")
  customStatus!: string;

  @OneToOne(() => User, (user) => user.activity)
  owner!: User;
}
