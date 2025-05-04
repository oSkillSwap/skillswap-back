import { User } from "../models/associations.js";

(async () => {
	const email = "admin@gmail.com";

	const user = await User.findOne({ where: { email } });
	if (!user) {
		console.log("Utilisateur non trouvé");
		return;
	}

	user.role = "admin";
	await user.save();

	console.log(`Rôle de ${user.username} mis à jour en admin`);
})();
