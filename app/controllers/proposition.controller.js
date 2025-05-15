import { Op, Sequelize } from "sequelize";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ConflictError } from "../errors/conflict-error.js";
import { ForbiddenError } from "../errors/forbidden-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { Post, Proposition, User, Review } from "../models/associations.js";

export const propositionController = {
  // Get all user's proposition
  getProposition: async (req, res, next) => {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

    const propositions = await Proposition.findAll({
      where: {
        [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
      },
      include: [
        {
          model: Post,
          attributes: ["id", "title"],
          include: {
            association: "SkillWanted",
          },
        },
        {
          association: "Sender",
          attributes: ["id", "username", "avatar"],
        },
        {
          association: "Receiver",
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ propositions });
  },

  // user send proposition
  getUserSentPropositions: async (req, res, next) => {
    const user = req.user;
    if (!user) return next(new UnauthorizedError("Utilisateur non authentifié"));

    const propositions = await Proposition.findAll({
      where: { sender_id: user.id },
      include: [
        {
          required: true,
          association: "Receiver",
          attributes: [
            "id",
            "username",
            "avatar",
            "description",
            [Sequelize.fn("AVG", Sequelize.col("Receiver->Reviews.grade")), "averageGrade"],
            [Sequelize.fn("COUNT", Sequelize.col("Receiver->Reviews.grade")), "nbOfReviews"],
          ],
          include: {
            association: "Reviews",
            attributes: [],
          },
        },
        {
          model: Post,
          include: {
            association: "SkillWanted",
          },
        },
        {
          model: Review,
          required: false,
          attributes: ["grade", "content", "user_id", "reviewed_id"],
        },
      ],
      group: ["Proposition.id", "Receiver.id", "Post.id", "Post->SkillWanted.id"],
    });

    return res.status(200).json({ propositions });
  },

  // Send a proposition to a specific post
  sendPropositionToPost: async (req, res, next) => {
    const { postId } = req.params;
    const user = req.user;
    if (!user) return next(new UnauthorizedError("Utilisateur non authentifié"));

    const post = await Post.findByPk(postId);
    if (!post) return next(new NotFoundError("Annonce non trouvée"));
    if (post.user_id === user.id) {
      return next(
        new BadRequestError("Vous ne pouvez pas envoyer une proposition à votre propre annonce"),
      );
    }
    if (post.isClosed) {
      return next(new ForbiddenError("Cette annonce n'accepte plus de proposition"));
    }

    const alreadySent = await Proposition.findOne({
      where: {
        sender_id: user.id,
        receiver_id: post.user_id,
        post_id: post.id,
        state: "en attente",
      },
    });
    if (alreadySent) {
      return next(
        new BadRequestError("Une proposition en attente a déjà été envoyée à cette annonce"),
      );
    }

    const { content } = req.validatedData;

    const newProposition = await Proposition.create({
      content,
      state: "en attente",
      sender_id: user.id,
      post_id: post.id,
      receiver_id: post.user_id,
    });

    return res.status(201).json({
      message: `Proposition bien envoyé à l'annonce: ${post.title}`,
      newProposition,
    });
  },

  // Accept a proposition for a specific post
  acceptProposition: async (req, res, next) => {
    const propositionId = Number(req.params.id);
    const userId = req.user.id;

    const proposition = await Proposition.findByPk(propositionId, {
      include: [{ model: Post }],
    });
    if (!proposition) return next(new NotFoundError("Proposition non trouvée"));

    const post = proposition.Post;
    if (post.user_id !== userId) {
      return next(new ForbiddenError("Vous n'etes pas le propriétaire de cette annonce"));
    }

    if (proposition.receiver_id !== userId) {
      return next(new ForbiddenError("Vous ne pouvez pas accepter cette proposition"));
    }

    if (proposition.sender_id === userId) {
      return next(new BadRequestError("Vous ne pouvez pas accepter votre propre proposition"));
    }

    if (proposition.state === "acceptée") {
      return next(new ConflictError("Cette proposition a déjà été acceptée"));
    }

    if (proposition.state === "refusée") {
      return next(new ConflictError("Cette proposition a déjà été refusée"));
    }

    if (post.isClosed) {
      return next(new ForbiddenError("Cette annonce n'accepte plus de proposition"));
    }

    proposition.state = "acceptée";
    await proposition.save();

    await Proposition.update(
      { state: "refusée" },
      {
        where: {
          post_id: post.id,
          id: { [Op.ne]: propositionId },
        },
      },
    );

    post.isClosed = true;
    await post.save();

    res.status(200).json({ message: "Proposition acceptée et annonce fermée." });
  },

  // Get all propositions where user is sender OR receiver
  getMyPropositions: async (req, res, next) => {
    const user = req.user;
    if (!user) return next(new UnauthorizedError("Utilisateur non authentifié"));

    const propositions = await Proposition.findAll({
      where: {
        [Op.or]: [{ sender_id: user.id }, { receiver_id: user.id }],
      },
      include: [
        {
          model: Post,
          attributes: ["id", "title", "content", "createdAt", "user_id"],
          include: { association: "SkillWanted" },
        },
        {
          association: "Sender",
          attributes: [
            "id",
            "username",
            "avatar",
            [Sequelize.fn("AVG", Sequelize.col("Sender->Reviews.grade")), "averageGrade"],
            [Sequelize.fn("COUNT", Sequelize.col("Sender->Reviews.grade")), "nbOfReviews"],
          ],
          include: {
            association: "Reviews",
            attributes: [],
          },
        },
        {
          association: "Receiver",
          attributes: [
            "id",
            "username",
            "avatar",
            [Sequelize.fn("AVG", Sequelize.col("Receiver->Reviews.grade")), "averageGrade"],
            [Sequelize.fn("COUNT", Sequelize.col("Receiver->Reviews.grade")), "nbOfReviews"],
          ],
          include: {
            association: "Reviews",
            attributes: [],
          },
        },
        {
          model: Review,
          required: false,
          attributes: ["id", "grade", "content", "user_id", "reviewed_id"],
          include: {
            association: "Reviewer",
            attributes: ["id", "username", "avatar"],
          },
        },
      ],
      group: [
        "Proposition.id",
        "Sender.id",
        "Receiver.id",
        "Post.id",
        "Post->SkillWanted.id",
        "Review.id",
        "Review->Reviewer.id",
      ],
      order: [["createdAt", "DESC"]],
    });

    const enriched = propositions.map((p) => ({
      ...p.toJSON(),
      hasReviewByOwner: p.Review?.Reviewer?.id === p.Post.user_id,
    }));

    return res.status(200).json({ propositions: enriched });
  },

  finishProposition: async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const prop = await Proposition.findByPk(id);
    if (!prop) return next(new NotFoundError("Proposition non trouvée"));

    if (prop.state !== "acceptée") {
      return next(new BadRequestError("Proposition non acceptée"));
    }

    if (prop.sender_id === userId) {
      prop.isFinishedBySender = true;
    } else if (prop.receiver_id === userId) {
      prop.isFinishedByReceiver = true;
    } else {
      return next(new ForbiddenError("Vous n'êtes pas concerné par cet échange"));
    }

    await prop.save();
    return res.status(200).json({ message: "Échange marqué comme terminé", prop });
  },
};
