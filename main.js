import path from "node:path";
import express from "express";
import { router } from "./app/routers/router.js";
import cors from "cors";

const app = express();

app.use(express.static(path.join(import.meta.dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(
		`✨🌟⭐ API SkillSwap lancée sur http://localhost:${port} ╰(*°▽°*)╯ ⭐🌟✨`,
	);
});
