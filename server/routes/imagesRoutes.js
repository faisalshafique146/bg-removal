import express from 'express';
import upload from '../middlewares/multer.js';
import authUser from '../middlewares/auth.js';
import removeBgImage from '../controller/imageController.js';

const imageRouter = express.Router();

imageRouter.post('/remove-bg', upload.single('image'), authUser, removeBgImage);

export default imageRouter;