import cors from "cors";
import express from "express";
import { router } from "./app/routers/router.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());

app.use(router);

app.listen(port, () => {
  console.log(
    `✨🌟⭐ API SkillSwap lancée sur http://localhost:${port} ╰(*°▽°*)╯ ⭐🌟✨`
  );
});
