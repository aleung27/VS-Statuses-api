import express from "express";
import https from "https";
import fs from "fs";
import * as dotenv from "dotenv";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { Tokens, generateTokens, authenticateTokens } from "./utilities/tokens";
import User from "./entities/User";
import axios from "axios";
import Activity from "./entities/Activity";
import bodyParse from "body-parser";
import { Octokit } from "@octokit/rest";

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

  app.use(bodyParse.json());

  /**
   * Link for when authentication to github fails
   */
  app.get("/failed", (req, res) => res.send("Authentication failed :("));

  /**
   * Link for when authentication to github is a success
   */
  app.get("/done", (req, res) =>
    res.send("Authentication complete. You can now close this window.")
  );

  /**
   * Testing token generation and authentication
   */
  // app.get("/gen", async (req, res) => {
  //   try {
  //     res.send(
  //       JSON.stringify(
  //         generateTokens(await User.findOneOrFail({ githubId: "59858450" }))
  //       )
  //     );
  //   } catch (e) {
  //     console.log(e);
  //   }
  // });
  // app.get("/testauth", authenticateTokens, (req, res) => res.send("nice!"));

  app.post("/auth", async (req, res, next) => {
    if (req.body?.accessToken) {
      // Make a new ocotokit with the access token
      const octokit = new Octokit({ auth: req.body.accessToken });
      try {
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
        };

        if (user) {
          await User.update(user.id, userData);
        } else {
          user = await User.create(userData).save();
        }

        // Generate access and refresh tokens and return to user
        res.json(generateTokens(user));
      } catch (err) {
        next(new Error("Bad Request"));
      }
    } else {
      // Incorrect body attached
      next(new Error("Bad Request"));
    }
    // We have an access token, make a req to github to get profile info -> create new user or find the current one & generate tokens whilst storing access token into db
  });

  server.listen(PORT, () => {
    console.log("Running...");
  });
};

main();
