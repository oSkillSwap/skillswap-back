import path from "node:path";
import cors from "cors";
import express from "express";
import { router } from "./app/routers/router.js";

const app = express();

app.use(express.static(path.join(import.meta.dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
	origin: (origin, callback) => {
		// En développement ou si frontend pas encore prêt, autoriser tout
		if (process.env.FRONTEND_URL === "*" || !origin) {
			return callback(null, true);
		}

		// Sinon, n'autoriser que les origines précises
		if (origin === process.env.FRONTEND_URL) {
			return callback(null, true);
		}

		// Sinon, bloquer
		return callback(new Error("Not allowed by CORS"));
	},
	credentials: true,
};
app.use(cors(corsOptions));

app.use("/api", router);

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
	console.log(
		`✨🌟⭐ API SkillSwap lancée sur http://localhost:${port} ╰(*°▽°*)╯ ⭐🌟✨`,
	);
});
