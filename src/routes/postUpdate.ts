import { Request, Response, NextFunction } from "express";
import Activity, { ActivityInterface } from "../entities/Activity";
import joi from "joi";
import createError from "http-errors";
import User from "../entities/User";

// Schema for what should be passed in the body of the req to the API
const activitySchema = joi.object({
  timestamp: joi.number().integer().positive().required(),
  language: joi.string().allow("").allow(null).lowercase().required(),
  filename: joi.string().allow("").allow(null).required(),
  workspaceName: joi.string().allow("").allow(null).required(),
  customStatus: joi.string().allow("").allow(null).required(),
});

const postUpdate = async (
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

  // Get the statuses of all following here!
  res.end();
};

export default postUpdate;
