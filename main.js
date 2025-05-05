import { readFile } from "node:fs/promises";
import path from "node:path";
import cors from "cors";
import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { router } from "./app/routers/router.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./app/views");

app.get("/", (req, res) => {
  res.render("index");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://localhost:5173",
    "https://skillswap.vercel.app",
    "https://localhost:3000",
    "http://localhost:300",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

// Chargez le fichier YAML contenant les schémas
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
      // Placez les schémas directement sous components.schemas
      schemas: swaggerSchemas.components.schemas,
    },
  },
  apis: ["./app/routers/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, { explorer: true })
);

app.use("/api", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `✨🌟⭐ API SkillSwap lancée sur http://localhost:${port} ╰(*°▽°*)╯ ⭐🌟✨`
  );
});
