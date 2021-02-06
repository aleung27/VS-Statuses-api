import express from "express";
import https from "https";
import fs from "fs";
import * as dotenv from "dotenv";
import "reflect-metadata";
import createError from "http-errors";
import bodyParse from "body-parser";

import { createConnection } from "typeorm";
import { authenticateTokens } from "./utilities/tokens";
import auth from "./routes/auth";
import update from "./routes/update";
import { errorCatcher, errorHandler } from "./utilities/errors";

const PORT = 8000;

const main = async () => {
  dotenv.config(); // Configure reading of .env file

  // Credentials for https
  const credentials = {
    key:
      process.env.NODE_ENV === "development"
        ? fs.readFileSync("./key.pem")
        : fs.readFileSync(
            "/etc/letsencrypt/live/vsstatuses.ddns.net/privkey.pem"
          ),
    cert:
      process.env.NODE_ENV === "development"
        ? fs.readFileSync("./cert.pem")
        : fs.readFileSync("/etc/letsencrypt/live/vsstatuses.ddns.net/cert.pem"),
    ca:
      process.env.NODE_ENV === "development"
        ? undefined
        : fs.readFileSync(
            "/etc/letsencrypt/live/vsstatuses.ddns.net/chain.pem"
          ),
  };

  const app = express();
  const server = https.createServer(credentials, app);

  // Setup the connection to the database
  const db = await createConnection().catch((e) => console.log(e));
  if (!db) {
    console.log("Database connection error");
    return;
  }

  app.use(bodyParse.json());

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

  app.get("/test", (req, res, next) => res.send("Testing complete"));

  // Use the custom error handler we made
  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log("Running...");
  });
};

main();
