import express from 'express';
import {
    getArticles,
    getArticleBySlug,
    createArticle,
    updateArticle,
    deleteArticle,
    getPendingArticles,
    updateArticleStatus
} from '../controllers/articleController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getArticles).post(protect, admin, createArticle);
router.route('/pending').get(protect, admin, getPendingArticles);
router.route('/:slug').get(getArticleBySlug);
router.route('/:id').put(protect, admin, updateArticle).delete(protect, admin, deleteArticle);
router.route('/:id/status').put(protect, admin, updateArticleStatus);

export default router;
