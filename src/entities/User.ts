import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  JoinColumn,
  OneToOne,
} from "typeorm";
import Activity from "./Activity";

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: number;

  @Column("varchar", { unique: true })
  githubId!: string;

  @Column("text")
  displayName!: string;

  @Column("text")
  profilePicUrl!: string;

  @OneToOne(() => Activity, (activity) => activity.owner)
  @JoinColumn()
  activity!: Activity;
}
