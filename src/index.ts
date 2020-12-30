import express from "express";
import https from "https";
import fs from "fs";
import passport from "passport";
import configurePassport from "./utilities/configurePassport";
import * as dotenv from "dotenv";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import { Tokens, generateTokens, authenticateTokens } from "./utilities/tokens";
import User from "./entities/User";
import axios from "axios";
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

  // Configure the passport setting for github auth
  configurePassport();
  app.use(passport.initialize());

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

  /**
   * Route for the initial authorisation of the user via github and passport.
   * We only really need profile information and access to the followers so
   * we use the read:user scope
   */
  app.get(
    "/auth",
    passport.authenticate("github", { session: false, scope: ["read:user"] })
  );

  /**
   * Callback URL which extracts the tokens from the request (which comes
   * from the tokens we pass into the callback from Passport). We then post
   * the tokens to the local server created inside VSCode to pass them for
   * use in the extenstion. Redirect to a simply done page after.
   */
  app.get(
    "/auth/callback",
    passport.authenticate("github", { failureRedirect: "/failed" }),
    async (req, res) => {
      try {
        const { accessToken, refreshToken } = req.user as Tokens;
        await axios.post("http://localhost:50000/tokens", {
          accessToken,
          refreshToken,
        });
        res.redirect("/done");
      } catch (e) {
        throw new Error("Internal Server Error");
      }
    }
  );

  server.listen(PORT, () => {
    console.log("Running...");
  });
};

main();
