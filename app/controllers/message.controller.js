import sanitize from "sanitize-html";
import { Op } from "sequelize";
import { Message, User } from "../models/associations.js";
import { messageSchema } from "../schemas/message.schema.js";

export const messageController = {
  getMessages: async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: user.id }, { receiver_id: user.id }], // Messages sent or received by the user
      },
    });

    if (messages.length <= 0) {
      res
        .status(200)
        .json({ message: "Aucun message trouvé pour cet utilisateur" });
    }

    // Return all messages related to the user
    return res.status(200).json({ messages });
  },
  // Get a conversation between two users
  getConversation: async (req, res) => {
    const { me, userId } = req.params;

    const loggedInUser = await User.findByPk(me);
    const conversationPartner = await User.findByPk(userId);

    if (!loggedInUser || !conversationPartner) {
      return res.status(404).json({ message: "Utilisateur(s) non trouvé(s)" });
    }

    // Fetch all messages between the two users (both directions)
    const conversation = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: me, receiver_id: userId }, // Messages sent by the logged-in user to the other user
          { sender_id: userId, receiver_id: me }, // Messages sent by the other user to the logged-in user
        ],
      },
      include: [
        {
          association: "Sender", // Include sender details
          attributes: ["id", "username"], // Only fetch sender's id and username
        },
        {
          association: "Receiver", // Include receiver details
          attributes: ["id", "username"], // Only fetch receiver's id and username
        },
      ],
    });

    if (conversation.length <= 0) {
      return res
        .status(200)
        .json({ message: "Aucune conversation entre ces utilisateurs" });
    }

    // Return the conversation between the two users
    return res.status(200).json({ conversation });
  },
  createMessage: async (req, res, next) => {
    const { me, userId } = req.params; // Extract sender and receiver IDs from request parameters
    const { message } = req.validatedData; // Extract the validated message content

    // Check if both users exist in the database
    const loggedInUser = await User.findByPk(me);
    const conversationPartner = await User.findByPk(userId);

    const sanitizedMessage = sanitize(message).trim(); // Sanitize the message content to prevent XSS

    if (!loggedInUser || !conversationPartner) {
      return res.status(404).json({ message: "Utilisateur(s) non trouvé(s)" }); // Return error if either user is not found
    }

    // Prevent users from sending messages to themselves
    if (me === userId) {
      return res
        .status(403)
        .json({ message: "Impossible d'envoyer un message à soi-même" });
    }

    if (!sanitizedMessage || !sanitizedMessage.trim()) {
      return res
        .status(400)
        .json({ message: "Le message invalide après suppression des balises" });
    }

    // Create a new message in the database
    const newMessage = await Message.create({
      sender_id: me, // ID of the sender
      receiver_id: userId, // ID of the receiver
      content: sanitizedMessage,
    });

    // Return success response with the newly created message
    return res.status(201).json({
      message: `Le message a bien été envoyé à ${conversationPartner.username}`,
      newMessage,
    });
  },
};
