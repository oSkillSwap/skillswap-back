import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { registerSchema, loginSchema } from '../schemas/user.schema.js';
import { validate } from '../middlewares/validates.js';


export const router = Router();

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);