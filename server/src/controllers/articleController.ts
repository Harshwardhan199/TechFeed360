import { Request, Response } from 'express';
import Article from '../models/Article';

// @desc    Get all published articles
// @route   GET /api/articles
// @access  Public
const getArticles = async (req: Request, res: Response) => {
    const pageSize = 21;
    const page = Number(req.query.pageNumber) || 1;

    const keywordText = (req.query.keyword as string) || "";

    const keyword =
        keywordText.trim()
            ? { title: { $regex: keywordText, $options: "i" } }
            : {};

    const query = { ...keyword, status: "published" };

    const count = await Article.countDocuments(query);

    const articles = await Article.find(query)
        .populate("category", "name slug")
        .sort({ published_at: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ articles, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Get single article
// @route   GET /api/articles/:slug
// @access  Public
const getArticleBySlug = async (req: Request, res: Response) => {
    const article = await Article.findOne({ slug: req.params.slug as string }).populate('category', 'name slug');

    if (article) {
        // Increment views
        article.views = (article.views || 0) + 1;
        await article.save();
        res.json(article);
    } else {
        res.status(404).json({ message: 'Article not found' });
    }
};

// @desc    Create article
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = async (req: Request, res: Response) => {
    const { title, slug, summary, content, image, tags, category, source, source_url, published_at } = req.body;

    const article = new Article({
        title,
        slug,
        summary,
        content,
        image,
        tags,
        category,
        source,
        source_url,
        published_at: published_at || Date.now(),
        hash: req.body.hash,
        status: 'published'
    });

    const createdArticle = await article.save();
    res.status(201).json(createdArticle);
}

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = async (req: Request, res: Response) => {
    const article = await Article.findById(req.params.id);

    if (article) {
        article.title = req.body.title || article.title;
        article.slug = req.body.slug || article.slug;
        article.summary = req.body.summary || article.summary;
        article.content = req.body.content || article.content;
        article.image = req.body.image || article.image;
        article.tags = req.body.tags || article.tags;
        article.category = req.body.category || article.category;
        article.status = req.body.status || article.status;

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } else {
        res.status(404).json({ message: 'Article not found' });
    }
}

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = async (req: Request, res: Response) => {
    const article = await Article.findById(req.params.id);

    if (article) {
        await article.deleteOne();
        res.json({ message: 'Article removed' });
    } else {
        res.status(404).json({ message: 'Article not found' });
    }
}

// @desc    Get pending articles
// @route   GET /api/articles/pending
// @access  Private/Admin
const getPendingArticles = async (req: Request, res: Response) => {
    try {
        const articles = await Article.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// @desc    Update article status
// @route   PUT /api/articles/:id/status
// @access  Private/Admin
const updateArticleStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['published', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const article = await Article.findByIdAndUpdate(id, { status }, { new: true });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export {
    getArticles,
    getArticleBySlug,
    createArticle,
    updateArticle,
    deleteArticle,
    getPendingArticles,
    updateArticleStatus
};
