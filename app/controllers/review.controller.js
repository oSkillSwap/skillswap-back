import { Op } from "sequelize";
import { ForbiddenError } from "../errors/forbidden-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { Post, Proposition, Review, User } from "../models/associations.js";

export const reviewController = {
  getReviews: async (req, res, next) => {
    const reviews = await Review.findAll({
      where: {
        content: {
          [Op.not]: null,
        },
      },
      attributes: {
        exclude: ["user_id", "proposition_id"],
      },
      include: [
        {
          association: "Reviewer",
          attributes: {
            exclude: ["password"],
          },
          where: {
            isBanned: false,
          },
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 6,
    });

    return res.status(200).json({ reviews });
  },

  getReviewsFromUser: async (req, res, next) => {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    const reviews = await Review.findAll({
      where: {
        where: { reviewed_id: id },
      },
      include: [
        {
          association: "Reviewer",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: Proposition,
          required: true,
          include: {
            model: Post,
            required: true,
            attributes: ["id", "title"],
            include: {
              association: "Author",
              attributes: ["id", "username", "avatar", "description"],
            },
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ reviews });
  },

  updateReview: async (req, res, next) => {
    const { reviewId } = req.params;
    const { grade, content } = req.validatedData;
    const userId = req.user.id;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return next(new NotFoundError("Review non trouvée"));
    }

    if (review.user_id !== userId) {
      return next(new ForbiddenError("Vous ne pouvez modifier que vos propres reviews"));
    }

    await review.update({ grade, content });

    return res.status(200).json({ message: "Review mise à jour avec succès", review });
  },

  createReview: async (req, res, next) => {
    const userId = req.user.id;
    const { postId, propositionId, grade, title, comment } = req.validatedData;

    const post = await Post.findByPk(postId);
    if (!post) {
      return next(new NotFoundError("Annonce non trouvée"));
    }

    if (!post.isClosed) {
      return next(new ForbiddenError("L'annonce doit être fermée pour laisser un avis"));
    }

    const proposition = await Proposition.findOne({
      where: {
        id: propositionId,
        post_id: postId,
      },
      attributes: ["id", "receiver_id", "sender_id", "post_id", "state"],
    });
    if (!proposition) {
      return next(new NotFoundError("La proposition est introuvable"));
    }

    if (proposition.state !== "acceptée") {
      return next(new ForbiddenError("La proposition n'est pas acceptée"));
    }

    if (post.user_id !== userId) {
      return next(
        new ForbiddenError("Vous n'avez pas le droit de laisser un avis sur cette annonce"),
      );
    }

    const reviewedId = proposition.sender_id;

    const existingReview = await Review.findOne({
      where: {
        user_id: userId,
        proposition_id: proposition.id,
      },
    });

    if (existingReview) {
      return next(
        new ForbiddenError(
          "Vous avez déjà laissé un avis pour cette annonce et cette proposition.",
        ),
      );
    }

    const existingReviewForUser = await Review.findOne({
      where: {
        user_id: userId,
      },
      include: {
        model: Proposition,
        required: true,
        where: {
          sender_id: reviewedId,
        },
      },
    });

    if (existingReviewForUser) {
      return next(new ForbiddenError("Vous avez déjà laissé un avis pour cet utilisateur."));
    }

    const review = await Review.create({
      grade,
      title,
      content: comment,
      user_id: userId,
      reviewed_id: reviewedId,
      proposition_id: proposition.id,
    });

    res.status(201).json({ message: "Évaluation créée avec succès", review });
  },
};
