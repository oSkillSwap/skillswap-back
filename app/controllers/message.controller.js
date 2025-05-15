import { Op } from "sequelize";
import { ForbiddenError } from "../errors/forbidden-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { ValidationError } from "../errors/validation-error.js";
import { Message, User } from "../models/associations.js";

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
          attributes: ["id", "username", "avatar"],
        },
        {
          association: "Receiver",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    if (!messages.length) {
      return res.status(200).json({ message: "Aucun message trouvé" });
    }

    return res.status(200).json({ messages });
  },

  getConversation: async (req, res) => {
    const { userIdOrUsername } = req.params;
    const loggedInUserId = req.user.id;

    const conversationPartner = await User.findOne({
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
      where: isNaN(userIdOrUsername)
        ? { username: userIdOrUsername }
        : { id: Number(userIdOrUsername) },
      attributes: ["id", "username", "avatar"],
    });

    if (!conversationPartner) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    const conversation = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: loggedInUserId, receiver_id: conversationPartner.id },
          { sender_id: conversationPartner.id, receiver_id: loggedInUserId },
        ],
      },
      include: [
        {
          association: "Sender",
          attributes: ["id", "username", "avatar"],
        },
        {
          association: "Receiver",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });

    if (conversation.length <= 0) {
      return res.status(200).json({ message: "Aucune conversation entre ces utilisateurs" });
    }

    return res.status(200).json({ conversation });
  },

  createMessage: async (req, res, next) => {
    const { userIdOrUsername } = req.params;
    const sender = req.user;
    const { message } = req.validatedData;

    const conversationPartner = await User.findOne({
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
      where: isNaN(userIdOrUsername)
        ? { username: userIdOrUsername }
        : { id: Number(userIdOrUsername) },
    });

    if (!conversationPartner) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    if (sender.username === conversationPartner.username) {
      return next(new ForbiddenError("Impossible d'envoyer un message à soi-même"));
    }

    if (Number(sender.id) === Number(userIdOrUsername)) {
      return next(new ForbiddenError("Impossible d'envoyer un message à soi-même"));
    }

    if (!message) {
      return next(new ValidationError("Le message est invalide après suppression des balises"));
    }

    const newMessage = await Message.create({
      sender_id: sender.id,
      receiver_id: conversationPartner.id,
      content: message,
    });

    return res.status(201).json({
      message: `Le message a bien été envoyé à ${conversationPartner.username}`,
      newMessage,
    });
  },
};
