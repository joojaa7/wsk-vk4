import express from 'express';
import {getMe, postLogin} from '../controllers/auth-controller.js';
import {authenticateToken} from '../../middlewares.js';

const authRouter = express.Router();

authRouter.route('/login').post(postLogin);

authRouter.route('/me').get(authenticateToken, getMe);

export default authRouter;
