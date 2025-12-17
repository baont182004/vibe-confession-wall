
import Post from '../models/Post.js';
import Reaction from '../models/Reaction.js';
import Comment from '../models/Comment.js';
import sanitizeHtml from 'sanitize-html';
import { canEditPost, canDeletePost } from '../lib/policy.js';

export const createPost = async (req, res) => {
  const cleanContent = sanitizeHtml(req.body.content);

  const post = await Post.create({
    authorId: req.user._id,
    content: cleanContent,
    tags: req.body.tags || [],
  });

  // Populate author details for immediate return
  await post.populate('authorId', 'nickname avatarId avatarUrl');

  res.status(201).json(post);
};

export const getPosts = async (req, res) => {
  const { sort = 'latest', page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  const query = { status: 'active' };

  if (search) {
    // Basic search avoiding Regex DoS by not using catastrophic backtracking patterns
    // Better approach: Text Index search
    // query.$text = { $search: search }; 
    // Fallback simple regex
    query.content = { $regex: search.substring(0, 50), $options: 'i' };
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'trending') {
    sortOption = { 'reactionCounts.heart': -1, createdAt: -1 };
  }

  const posts = await Post.find(query)
    .sort(sortOption)
    .skip(Number(skip))
    .limit(Number(limit))
    .populate('authorId', 'nickname avatarId avatarUrl')
    .lean();

  const postsWithComments = await Promise.all(posts.map(async (post) => {
    const featuredComments = await Comment.find({ postId: post._id, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('authorId', 'nickname avatarId avatarUrl')
      .lean();
    return { ...post, featuredComments };
  }));

  const total = await Post.countDocuments(query);

  res.json({ posts: postsWithComments, page: Number(page), pages: Math.ceil(total / limit) });
};

export const toggleReaction = async (req, res) => {
  const { id, type } = req.params; // type: heart, hug, thanks
  const userId = req.user._id;

  const validTypes = ['heart', 'hug', 'thanks'];
  if (!validTypes.includes(type)) return res.status(400).json({ message: 'Invalid type' });

  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const existing = await Reaction.findOne({ targetId: id, userId, targetType: 'Post' });

  if (existing) {
    if (existing.type === type) {
      await existing.deleteOne();
      post.reactionCounts[type] = Math.max(0, post.reactionCounts[type] - 1);
    } else {
      post.reactionCounts[existing.type] = Math.max(0, post.reactionCounts[existing.type] - 1);
      existing.type = type;
      await existing.save();
      post.reactionCounts[type] += 1;
    }
  } else {
    await Reaction.create({ targetId: id, userId, type, targetType: 'Post' });
    post.reactionCounts[type] += 1;
  }

  await post.save();
  res.json({ counts: post.reactionCounts, current: existing && existing.type === type ? null : type });
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const perm = canEditPost(req.user, post);
  if (!perm.allowed) return res.status(perm.code || 403).json({ message: 'Forbidden' });
  post.content = sanitizeHtml(req.body.content || post.content);
  await post.save();
  await post.populate('authorId', 'nickname avatarId avatarUrl');
  res.json(post);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const perm = canDeletePost(req.user, post);
  if (!perm.allowed) return res.status(perm.code || 403).json({ message: 'Forbidden' });
  post.status = 'deleted';
  await post.save();
  res.json({ message: 'Deleted' });
};
