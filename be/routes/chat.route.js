import express from 'express';
import { sendMessage, getChatHistory, getConversations, deleteConversation } from '../controllers/chat.controller.js';
import { authMiddleware} from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/history/:conversationId', getChatHistory);
router.delete('/conversations/:conversationId', deleteConversation);

export default router;