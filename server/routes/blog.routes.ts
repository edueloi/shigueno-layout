import { Router } from 'express';
import { 
  getBlogPosts, 
  getBlogCategories, 
  getBlogAuthors, 
  saveBlogPost, 
  deleteBlogPost, 
  saveBlogAuthor, 
  deleteBlogAuthor, 
  saveBlogCategory, 
  deleteBlogCategory,
  incrementPostViews
} from '../../server-db';

const router = Router();

// --- POSTS ---
router.get('/blog/posts', async (req, res) => {
  try {
    const posts = await getBlogPosts();
    res.json({ success: true, posts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/blog/posts', async (req, res) => {
  try {
    const postData = req.body;
    const post = await saveBlogPost(postData);
    res.json({ success: true, post });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/blog/posts/:id/view', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await incrementPostViews(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/blog/posts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await deleteBlogPost(id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- CATEGORIES ---
router.get('/blog/categories', async (req, res) => {
  try {
    const categories = await getBlogCategories();
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/blog/categories', async (req, res) => {
  try {
    const catData = req.body;
    const category = await saveBlogCategory(catData);
    res.json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/blog/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await deleteBlogCategory(id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- AUTHORS ---
router.get('/blog/authors', async (req, res) => {
  try {
    const authors = await getBlogAuthors();
    res.json({ success: true, authors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/blog/authors', async (req, res) => {
  try {
    const authorData = req.body;
    const author = await saveBlogAuthor(authorData);
    res.json({ success: true, author });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/blog/authors/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await deleteBlogAuthor(id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
