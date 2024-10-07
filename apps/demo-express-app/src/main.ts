/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { fal } from "@fal-ai/client";
import * as falProxy from "@fal-ai/server-proxy/express";
import cors from "cors";
import { configDotenv } from "dotenv";
import express from "express";
import * as path from "path";

configDotenv({ path: "./env.local" });

const app = express();

// Middlewares
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.json());

// fal.ai client proxy
app.all(falProxy.route, cors(), falProxy.handler);

// Your API endpoints
app.get("/api", (req, res) => {
  res.send({ message: "Welcome to demo-express-app!" });
});

app.get("/fal-on-server", async (req, res) => {
  const result = await fal.run("110602490-lcm", {
    input: {
      prompt:
        "a black cat with glowing eyes, cute, adorable, disney, pixar, highly detailed, 8k",
    },
  });
  res.send(result);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
