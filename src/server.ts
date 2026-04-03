import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import http from "http";
import { PlayStoreUpdateJob } from "./jobs/playstoreUpdate.job";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  const playStoreUpdateJob = new PlayStoreUpdateJob();
  playStoreUpdateJob.start();
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
  });
});
