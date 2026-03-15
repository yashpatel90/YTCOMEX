import serverless from "serverless-http";
import { app } from "../../src/api/app.ts";

export const handler = serverless(app);
