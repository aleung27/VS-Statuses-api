import express from "express";
import https from "https";
import fs from "fs";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import * as dotenv from "dotenv";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import User from "./entities/User";
import Activity from "./entities/Activity";

const PORT = 8000;

const main = async () => {
  const key = fs.readFileSync("./key.pem");
  const cert = fs.readFileSync("./cert.pem");
  dotenv.config(); // Configure reading of .env file

  const app = express();
  const server = https.createServer({ key, cert }, app);

  // Setup the connection to the database
  const db = await createConnection().catch((e) => console.log(e));
  if (!db) {
    console.log("Database connection error");
    return;
  }

  // Setup the passport strategy for github auth
  passport.use(
    new GitHubStrategy(
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
            profilePicUrl: profile.photos?.[0] ? profile.photos?.[0].value : "",
          };

          if (user) {
            await User.update(user.id, userData);
          } else {
            user = await User.create(userData).save();
          }

          callback(null, user);
        } catch (e) {
          console.log(e);
          callback(new Error("Internal Server Error"));
        }
      }
    )
  );
  // Needs API tokens!
  passport.serializeUser((user: User, done) => {
    done(null, user.id);
  });

  app.use(passport.initialize());

  app.get("/", (req, res) => res.send("Express Server Running"));

  app.get("/failed", (req, res) => res.send("Authentication failed :("));

  app.get("/done", (req, res) => res.send("You are done authenticating!"));

  app.get(
    "/auth",
    passport.authenticate("github", { session: false, scope: ["read:user"] })
  );

  app.get(
    "/auth/callback",
    passport.authenticate("github", { failureRedirect: "/failed" }),
    (req, res) => {
      console.log("req is:");
      console.log(req);
      console.log("req is:");
      console.log(res);
      res.redirect("/done");
    }
  );

  server.listen(PORT, () => {
    console.log("Running...");
  });
};

main();
