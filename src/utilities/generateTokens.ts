import { sign } from "jsonwebtoken";
import User from "../entities/User";

const generateTokens = (
  user: User
): { accessToken: string; refreshToken: string } => {
  /**
   * Generate the access token for our api with a 1 hr expiry and
   * generate the refresh token for our api with a 14d expiry.
   * The tokens contain the encoded user id for the token
   */
  return {
    accessToken: sign(
      JSON.stringify(user.id),
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "3600s",
      }
    ),
    refreshToken: sign(
      JSON.stringify(user.id),
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "14d" }
    ),
  };
};

export default generateTokens;
