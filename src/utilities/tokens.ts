import User from "../entities/User";
import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { verify, sign } from "jsonwebtoken";

/**
 * Generates the access and refresh tokens for our API for a user
 * @param user The User entity associated with the user we are generating the tokens for
 * @returns {accesstoken, refreshtoken} Tokens associated with the user granting access to out api
 */
const generateTokens = (
  user: User
): { accessToken: string; refreshToken: string } => {
  /**
   * Access token has 1hr expiry
   * Refresh token has 14d expiry
   * The tokens contain the encoded user id for the token
   */
  return {
    accessToken: sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "3600s",
    }),
    refreshToken: sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "14d",
    }),
  };
};

/**
 * Middleware for express. Authenticates a request based upon the tokens
 * attached to the request headers to determine if a user is verified or not.
 * Attempts to utilise access tokens before using refresh tokens to generate
 * new tokens if needed. Errors out if unable to verify or bad headers received
 * TODO: use Authorization header to stoire both access + refresh?
 * @param req The HTTP request received by our API
 * @param res The HTTP response sent by our API
 * @param next Middleware function designating the next function to call
 */
const authenticateTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // The access token received by our API in the header of the request
  const accessToken = req.headers["access-token"];

  // Check if the access token in the header is valid
  if (!accessToken || typeof accessToken !== "string")
    return next(createError(401, "Unauthorized"));

  try {
    // See if the access token is valid and call next() if it is
    // Append the id onto the res for user identification in express
    res.locals.id = (verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    ) as any).id;

    return next();
  } catch (e) {
    // Otherwise we check the refresh token is valid
    const refreshToken = req.headers["refresh-token"];
    if (!refreshToken || typeof refreshToken !== "string") {
      return next(createError(401, "Unauthorized"));
    }

    try {
      // Verify the refresh token and find the matching user for the encoded id
      const tokenData = verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as any;
      const user = await User.findOneOrFail({ id: tokenData.id });

      // If we found a user, generate new tokens and send them back
      const tokens = generateTokens(user);
      res.setHeader("access-token", tokens.accessToken);
      res.setHeader("refresh-token", tokens.refreshToken);
      res.locals.id = user.id;
    } catch (err) {
      return next(createError(401, "Unauthorized"));
    }
  }

  next();
};

export { generateTokens, authenticateTokens };
