import {Router} from 'express';
const router=Router();
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middleware/AuthMiddleware.js';
import ChatGroupController from '../controllers/ChatGroupController.js';

router.post("/auth/send-otp", AuthController.sendOTP);
router.post("/auth/login", AuthController.getUser);
router.get("/chat-group", authMiddleware, ChatGroupController.index);
router.get("/chat-group/:id", ChatGroupController.show);
router.post("/chat-group", authMiddleware, ChatGroupController.store);
router.put("/chat-group/:id", authMiddleware, ChatGroupController.update);
router.delete("/chat-group/:id", authMiddleware, ChatGroupController.destroy);
export default router;