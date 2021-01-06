import { Request, Response, NextFunction } from "express";
import User from "../entities/User";
import { Octokit } from "@octokit/rest";
import { generateTokens } from "../utilities/tokens";
import updateFollowing from "../utilities/updateFollowing";
import createError from "http-errors";
import joi from "joi";

const schema = joi.object({
  accessToken: joi.string().required(),
});

/**
 * Provides the logic for the auth route for our API. Requests into our API
 * auth route should have an access token attached to the body representing
 * the github access token passed from the extension. This is then used
 * to retrieve the user's github profile (validating the token simultaneously).
 * Either a new user is then registered or we update existing information
 * stored for the user in our database. Access and refresh tokens for
 * access to our API are then generated and returned to the user.
 *
 * @param req The Request object associated with the request to our API
 * @param res The Response object associated with the response to our API
 * @param next The next function to be called in the middleware stack
 */
const auth = async (req: Request, res: Response, next: NextFunction) => {
  // Validate the body and if it fails, error out
  const { error } = schema.validate(req.body);
  if (error) {
    return next(createError(400, "Bad Request"));
  }

  // Make a new octokit with the access token and get the user's profile info
  const octokit = new Octokit({ auth: req.body.accessToken });
  const profile = (await octokit.request("GET /user")).data;

  /**
   *  Either find the existing user matching the github profile id
   *  or create a new user with the given information from the profile
   *  Note, refreshToken is undefined for github!
   */
  let user: User | undefined = await User.findOne({
    githubId: profile.id,
  });

  const userData = {
    githubId: profile.id,
    accessToken: req.body.accessToken,
    username: profile.login,
    displayName: profile.name,
    profilePicUrl: profile.avatar_url,
    following: user ? user.following : [],
    followingEtag: user ? user.followingEtag : null,
  };

  if (user) {
    await User.update(user.id, userData);
  } else {
    user = await User.create(userData).save();
  }

  // Generate access and refresh tokens and return to user
  updateFollowing(user);
  res.json(generateTokens(user));
};

export default auth;
