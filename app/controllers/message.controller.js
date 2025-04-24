import { Op } from "sequelize";
import { Message, User } from "../models/associations.js";

export const messageController = {
  getMessages: async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: user.id }, { receiver_id: user.id }],
      },
    });

    if (messages.length <= 0) {
      res
        .status(200)
        .json({ message: "Aucun message trouvé pour cet utilisateur" });
    }

    return res.status(200).json({ messages });
  },
};
