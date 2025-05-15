import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import cookieParser from "cookie-parser";
import { router } from "./app/routers/router.js";
import messageSocketHandlers from "./app/sockets/message.socket.js";

const app = express();

// Express config
app.set("view engine", "ejs");
app.set("views", "./app/views");

app.get("/", (req, res) => {
  res.render("index");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS config
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://localhost:5173",
    "http://localhost:3000",
    "https://localhost:3000",
    "http://18.185.123.233:3000",
    "https://18.185.123.233:3000",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  credentials: true,
};
app.use(cors(corsOptions));

// Swagger doc config
const swaggerSchemas = YAML.load("./app/swagger/schemas.yaml");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API SkillSwap",
      version: "1.0.0",
      description: "Documentation de l'API SkillSwap",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: swaggerSchemas.components.schemas,
    },
  },
  apis: ["./app/routers/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

// Router
app.use("/api", router);

// Socket.IO integration
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Socket.IO server logic
messageSocketHandlers(io);

// Server launch
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`✨🌟⭐ API SkillSwap lancée sur http://localhost:${port} ⭐🌟✨`);
});
