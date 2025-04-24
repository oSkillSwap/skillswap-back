import { Op } from "sequelize";
import { Message, User } from "../models/associations.js";

export const messageController = {
  getMessages: async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
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
  getConversation: async (req, res) => {
    const { me, userId } = req.params;

    const loggedInUser = await User.findByPk(me);
    const conversationPartner = await User.findByPk(userId);

    if (!loggedInUser || !conversationPartner) {
      return res.status(404).json({ message: "Utilisateur(s) non trouvé(s)" });
    }

    const conversation = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: me, receiver_id: userId },
          { sender_id: userId, receiver_id: me },
        ],
      },
      include: [
        {
          association: "Sender",
          attributes: ["id", "username"],
        },
        {
          association: "Receiver",
          attributes: ["id", "username"],
        },
      ],
    });

    if (conversation.length <= 0) {
      return res
        .status(200)
        .json({ message: "Aucune conversation entre ces utilisateurs" });
    }

    return res.status(200).json({ conversation });
  },
};
