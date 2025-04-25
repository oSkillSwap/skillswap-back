import sanitize from "sanitize-html";
import { Op } from "sequelize";
import { Message, User } from "../models/associations.js";
import { messageSchema } from "../schemas/message.schema.js";

export const messageController = {
  getMessages: async (req, res, next) => {
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
      },
      order: [["createdAt", "DESC"]],
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

    if (!messages.length) {
      return res.status(200).json({ message: "Aucun message trouvé" });
    }

    return res.status(200).json({ messages });
  },

  getConversation: async (req, res) => {
    const { userId } = req.params;
    const loggedInUserId = req.user.id;

    const conversationPartner = await User.findByPk(userId);

    if (!conversationPartner) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const conversation = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: loggedInUserId, receiver_id: userId },
          { sender_id: userId, receiver_id: loggedInUserId },
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

  createMessage: async (req, res, next) => {
    const { userId } = req.params;
    const senderId = req.user.id;
    const { message } = req.validatedData;

    const conversationPartner = await User.findByPk(userId);

    const sanitizedMessage = sanitize(message).trim();

    if (!conversationPartner) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (senderId.toString() === userId) {
      return res
        .status(403)
        .json({ message: "Impossible d'envoyer un message à soi-même" });
    }

    if (!sanitizedMessage || !sanitizedMessage.trim()) {
      return res
        .status(400)
        .json({ message: "Le message invalide après suppression des balises" });
    }

    const newMessage = await Message.create({
      sender_id: senderId,
      receiver_id: userId,
      content: sanitizedMessage,
    });

    return res.status(201).json({
      message: `Le message a bien été envoyé à ${conversationPartner.username}`,
      newMessage,
    });
  },
};
