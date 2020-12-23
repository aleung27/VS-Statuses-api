import express from "express";
import https from "https";
import fs from "fs";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import * as dotenv from "dotenv";
import "reflect-metadata";
import { createConnection } from "typeorm";
import User from "./entities/User";
import Activity from "./entities/Activity";

const main = async () => {
  const key = fs.readFileSync("./key.pem");
  const cert = fs.readFileSync("./cert.pem");

  const app = express();
  const PORT = 8000;

  const server = https.createServer({ key, cert }, app);
  dotenv.config(); // Configure reading of .env file

  // Setup the connection to the database
  const db = await createConnection().catch((e) => console.log(e));
  console.log(db);

  // Setup the passport strategy for github auth
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.URL}/callback`,
      },
      (accessToken, refreshToken, profile, callback) => {
        // callback(Error, "b");
      }
    )
  );

  app.get("/", (req, res) => res.send("Express Server Running"));

  app.get(
    "/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  server.listen(PORT, () => {
    console.log("Running...");
  });
};

main();
