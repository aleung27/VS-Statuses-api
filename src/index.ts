import express from "express";
import https from "https";
import fs from "fs";
import passport from "passport";
import configurePassport from "./utilities/configurePassport";
import * as dotenv from "dotenv";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { generateTokens, authenticateTokens } from "./utilities/tokens";
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

  configurePassport();

  app.use(passport.initialize());

  app.get("/failed", (req, res) => res.send("Authentication failed :("));

  app.get("/done", (req, res) => res.send("You are done authenticating!"));

  app.get("/gen", async (req, res) => {
    try {
      res.send(
        JSON.stringify(
          generateTokens(await User.findOneOrFail({ githubId: "59858450" }))
        )
      );
    } catch (e) {
      console.log(e);
    }
  });

  app.get("/testauth", authenticateTokens, (req, res) => res.send("nice!"));

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
