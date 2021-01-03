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
  id!: string;

  /**
   * The unique github id associated with the user's github account
   */
  @Column("int", { unique: true })
  githubId!: number;

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
   * List of github Id's that the user is following
   */
  @Column("simple-array")
  following!: number[];

  /**
   * Etag of the last request to the user's following list
   */
  @Column("text")
  followingEtag!: string | null;

  /**
   * Latest activity associated with the user
   */
  @OneToOne(() => Activity, (activity) => activity.owner)
  @JoinColumn()
  activity!: Activity;
}
