import express from "express";
import https from "https";
import fs from "fs";
import * as dotenv from "dotenv";
import "reflect-metadata";
import createError from "http-errors";
import bodyParse from "body-parser";

import { createConnection, getConnection } from "typeorm";
import { Tokens, generateTokens, authenticateTokens } from "./utilities/tokens";
import auth from "./routes/auth";
import update from "./routes/update";
import { errorCatcher, errorHandler } from "./utilities/errors";

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
   * Route for authentication of the user for our API
   */
  app.post("/auth", errorCatcher(auth));

  /**
   * Route for the updating of the user's activity + getting statuses of following
   */
  app.post("/update", authenticateTokens, errorCatcher(update));

  /**
   * Match any other route with a 404 error
   */
  app.get("*", (req, res, next) => {
    next(createError(404, "Page not found :("));
  });

  // Use the custom error handler we made
  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log("Running...");
  });
};

main();
