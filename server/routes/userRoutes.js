import express from 'express';
import { clerkWebhooks, paymentRazorpay, userCredits } from '../controller/userController.js';
import authUser from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/webhooks', clerkWebhooks);
userRouter.get('/credits', authUser, userCredits);
userRouter.post('/pay-razor', authUser, paymentRazorpay);

export default userRouter;