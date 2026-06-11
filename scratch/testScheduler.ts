import { connectDB } from "../server/db.ts";
import { triggerScheduledTask } from "../server/schedulers/dataGenerator.ts";
import dotenv from "dotenv";

dotenv.config();

async function runTest() {
  console.log("Connecting to DB...");
  await connectDB();
  console.log("Triggering scheduled task...");
  await triggerScheduledTask();
  console.log("Test finished. Exiting...");
  process.exit(0);
}

runTest();
