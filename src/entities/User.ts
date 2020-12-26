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
  /**
   * The unique user id for each user
   */
  @PrimaryGeneratedColumn("uuid")
  id!: number;

  /**
   * The unique github id associated with the user's github account
   */
  @Column("varchar", { unique: true })
  githubId!: string;

  /**
   * The access token for the user's github profile
   * Note: Access tokens for githubs api does not expire until they are
   * revoked by the user, hence we can simply store the token in the
   * database without needing to use refresh tokens to generate new access
   * tokens everytime
   */
  @Column("text")
  accessToken!: string;

  /**
   * The user's github username. These are unique
   */
  @Column("varchar", { unique: true })
  username!: string;

  /**
   * The display name of the user. May not be set on github!
   */
  @Column("text", { nullable: true })
  displayName!: string | null;

  /**
   * Url to the user's github profile pic
   */
  @Column("text")
  profilePicUrl!: string;

  /**
   * Latest activity associated with the user
   */
  @OneToOne(() => Activity, (activity) => activity.owner)
  @JoinColumn()
  activity!: Activity;
}
