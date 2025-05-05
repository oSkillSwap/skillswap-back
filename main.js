import path from "node:path";
import cors from "cors";
import express from "express";
import { router } from "./app/routers/router.js";

const app = express();

app.use(express.static(path.join(import.meta.dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://localhost:5173/",
      "https://localhost:5173/",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/api", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `✨🌟⭐ API SkillSwap lancée sur http://localhost:${port} ╰(*°▽°*)╯ ⭐🌟✨`
  );
});
