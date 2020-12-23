import express from "express";
import https from "https";
import fs from "fs";

const key = fs.readFileSync("./key.pem");
const cert = fs.readFileSync("./cert.pem");

const app = express();
const PORT = 8000;

const server = https.createServer({ key, cert }, app);

app.get("/", (req, res) => res.send("Express Server Running"));
server.listen(PORT, () => {
  console.log("Running...");
});
