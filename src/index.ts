import express from "express";
import https from "https";
import fs from "fs";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github";
import * as dotenv from "dotenv";
import { exception } from "console";

const key = fs.readFileSync("./key.pem");
const cert = fs.readFileSync("./cert.pem");

const app = express();
const PORT = 8000;

const server = https.createServer({ key, cert }, app);
dotenv.config(); // Configure reading of .env file

// Setup the passport strategyt for github auth
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.URL}/callback`,
    },
    (accessToken, refreshToken, profile, callback) => {
      //callback(Error, "b");
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
