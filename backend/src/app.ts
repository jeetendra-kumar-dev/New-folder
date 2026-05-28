import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/cors";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { notFoundHandler } from "./middleware/not-found.middleware";
import { apiRoutes } from "./routes";

export const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.use(env.API_PREFIX, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
