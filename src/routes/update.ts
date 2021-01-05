import { Request, Response, NextFunction } from "express";
import Activity from "../entities/Activity";
import joi, { number } from "joi";
import createError from "http-errors";
import User from "../entities/User";
import Status from "../interfaces/Status";
import ActivityInterface from "../interfaces/ActivityInterface";

// Schema for what should be passed in the body of the req to the API
const activitySchema = joi.object({
  timestamp: joi.number().integer().positive().required(),
  language: joi.string().allow("").allow(null).lowercase().required(),
  filename: joi.string().allow("").allow(null).required(),
  workspaceName: joi.string().allow("").allow(null).required(),
  customMessage: joi.string().allow("").allow(null).required(),
});

/**
 * Get's the statuses of all the user's that the user is currently
 * following.
 * TODO: pagination or something when large # of following?
 * @param user The user to get the following statuses for
 */
const getStatuses = async (user: User) => {
  const statuses: Status[] = [];

  // For each of the user's we are following, see if they exist in the
  // database and return their activity if they do
  for (const id of user.following) {
    const nextUser = await User.findOne(
      { githubId: id },
      {
        join: {
          alias: "user",
          innerJoinAndSelect: {
            activity: "user.activity",
          },
        },
      }
    );

    if (nextUser) {
      statuses.push({
        username: nextUser.username,
        displayName: nextUser.displayName,
        profilePicUrl: nextUser.profilePicUrl,
        timestamp: nextUser.activity.timestamp,
        language: nextUser.activity.language,
        filename: nextUser.activity.filename,
        workspaceName: nextUser.activity.workspaceName,
        customMessage: nextUser.activity.customMessage,
      });
    }
  }

  return statuses;
};

/**
 * Provides the logic for the update POST route for our API. Requests into our
 * API should follow the above Joi shchema in the body with the relevant info.
 * We then update the database with the latest activity before getting the
 * activity of all the people we are following and returning that in the
 * response back to the extension.
 *
 * @param req The Request object associated with the request to our API
 * @param res The Response object associated with the response to our API
 * @param next The next function to be called in the middleware stack
 */
const update = async (
  req: Request<{}, {}, ActivityInterface>,
  res: Response,
  next: NextFunction
) => {
  // Validate the body and if it fails, error out
  const { error } = activitySchema.validate(req.body);
  if (error) {
    return next(createError(400, "Bad Request"));
  } else if (!res.locals.id) {
    return next(createError(500, "Internal Server Error"));
  }

  // Find the user associated with the access token used to interact with the API
  const user = await User.findOneOrFail(res.locals.id, {
    loadRelationIds: true,
  });

  if (user.activity) {
    // User already has a past activity associated with their account
    // The Id's stay the same, only the req body needs updating
    await Activity.update(user.activity, req.body);
  } else {
    // User does not have a past activity so we have to make one
    const newActivity = await Activity.create({
      ...req.body,
      owner: user,
    }).save();
    user.activity = newActivity;
    await User.update(user.id, user);
  }

  // Send the statuses of all we are following
  res.json(await getStatuses(user));
};

export default update;
