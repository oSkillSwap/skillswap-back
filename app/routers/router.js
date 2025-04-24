
import { Router } from 'express';
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { userController } from '../controllers/user.controller.js';
import { registerSchema, loginSchema } from '../schemas/user.schema.js';
import { validate } from '../middlewares/validates.js';
import { reviewController } from "../controllers/review.controller.js";


export const router = Router();


router.post('/register', validate(registerSchema), controllerwrapper(userController.register));
router.post('/login', validate(loginSchema), controllerwrapper(userController.login));

router.get("/users/", controllerwrapper(userController.getUsers));
router.get("/reviews", controllerwrapper(reviewController.getReviews));

