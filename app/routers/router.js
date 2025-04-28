import { Router } from "express";
import { availabilityController } from "../controllers/availability.controller.js";
import { categoryontroller } from "../controllers/category.controller.js";
import { messageController } from "../controllers/message.controller.js";
import { postController } from "../controllers/post.controller.js";
import { propositionController } from "../controllers/proposition.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { skillController } from "../controllers/skill.controller.js";
import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { messageSchema } from "../schemas/message.schema.js";
import { postSchema } from "../schemas/post.schema.js";
import { loginSchema, registerSchema } from "../schemas/user.schema.js";

export const router = Router();

router.get("/users", controllerwrapper(userController.getUsers));
router.post(
  "/register",
  validate(registerSchema),
  controllerwrapper(userController.register)
);
router.post(
  "/login",
  validate(loginSchema),
  controllerwrapper(userController.login)
);

router.get("/reviews", controllerwrapper(reviewController.getReviews));
router.get(
  "/reviews/:id",
  validateParams("id"),
  controllerwrapper(reviewController.getReviewsFromUser)
);

router.get("/categories", controllerwrapper(categoryontroller.getCategories));

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    message: "Utilisateur connecté",
    user: req.user,
  });
});

router.get("/posts/:id", controllerwrapper(postController.getPostsFromUser));

router.get(
  "/me/messages",
  authenticate,
  controllerwrapper(messageController.getMessages)
);

router
  .route("/me/messages/:userId")
  .get(
    authenticate,
    validateParams("userId"),
    controllerwrapper(messageController.getConversation)
  )
  .post(
    authenticate,
    validateParams("userId"),
    validate(messageSchema),
    messageController.createMessage
  );

router.get(
  "/availabilities",
  controllerwrapper(availabilityController.getAvailabilities)
);

router.get("/posts", controllerwrapper(postController.getPosts));
router
  .route("/me/posts")
  .get(authenticate, controllerwrapper(postController.getPostFromLoggedUser))
  .post(
    authenticate,
    validate(postSchema),
    controllerwrapper(postController.createPost)
  );

// Follows and followers from User by params
router.get(
  "/users/follows/:id",
  validateParams("id"),
  controllerwrapper(userController.getFollowersAndFollowsFromUser)
);

// Follows and followers from logged in User
router.get("/me/follows", authenticate, async (req, res, next) => {
  req.params.id = req.user.id;

  return userController.getFollowersAndFollowsFromUser(req, res, next);
});

router.get("/skills", controllerwrapper(skillController.getSkills));
router.get(
  "/propositions/:userId",
  controllerwrapper(propositionController.getSentAndReceivedPropositions)
);

router.use(errorMiddleware);
