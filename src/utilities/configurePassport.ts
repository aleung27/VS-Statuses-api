import User from "../entities/User";
import passport from "passport";
import { Strategy } from "passport-github";
import { generateTokens } from "./tokens";

/**
 * Configures the passport strategy for the express app for usage in
 * conjunction with the Github OAuth strategy
 */
const configurePassport = () => {
  passport.use(
    new Strategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.URL}/auth/callback`,
      },
      async (accessToken, refreshToken, profile, callback) => {
        try {
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
            accessToken,
            username: profile.username,
            displayName: profile.displayName,
            profilePicUrl: profile.photos?.[0].value ?? "",
          };

          if (user) {
            await User.update(user.id, userData);
          } else {
            user = await User.create(userData).save();
          }

          callback(null, generateTokens(user));
        } catch (e) {
          console.log(e);
          callback(new Error("Internal Server Error"));
        }
      }
    )
  );

  passport.serializeUser((user: User, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: User, done) => {
    done(null, user);
  });
};

export default configurePassport;
