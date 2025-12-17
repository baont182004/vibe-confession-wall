import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import AdminAudit from '../models/AdminAudit.js';

export const overview = async (req, res) => {
  const usersCount = await User.countDocuments();
  const postsCount = await Post.countDocuments({ status: { $ne: 'deleted' } });
  const commentsCount = await Comment.countDocuments({ status: { $ne: 'deleted' } });

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const daily = await Post.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: 'deleted' } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({ usersCount, postsCount, commentsCount, last7Days: daily });
};

export const listPosts = async (req, res) => {
  const { page = 1, limit = 10, q, author } = req.query;
  const skip = (page - 1) * limit;
  const query = {};
  if (q) query.content = { $regex: q.substring(0, 100), $options: 'i' };
  if (author) query.authorId = author;
  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .populate('authorId', 'nickname avatarId avatarUrl');
  const total = await Post.countDocuments(query);
  res.json({ items: posts, page: Number(page), pages: Math.ceil(total / limit), total });
};

export const deletePostAdmin = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.status = 'deleted';
  await post.save();
  await AdminAudit.create({ adminId: req.user._id, action: 'delete_post', targetType: 'Post', targetId: post._id });
  res.json({ message: 'Deleted' });
};

export const listComments = async (req, res) => {
  const { page = 1, limit = 10, q, postId } = req.query;
  const skip = (page - 1) * limit;
  const query = {};
  if (q) query.content = { $regex: q.substring(0, 100), $options: 'i' };
  if (postId) query.postId = postId;
  const comments = await Comment.find(query)
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Number(limit))
    .populate('authorId', 'nickname avatarId avatarUrl');
  const total = await Comment.countDocuments(query);
  res.json({ items: comments, page: Number(page), pages: Math.ceil(total / limit), total });
};

export const deleteCommentAdmin = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  comment.status = 'deleted';
  await comment.save();
  await AdminAudit.create({ adminId: req.user._id, action: 'delete_comment', targetType: 'Comment', targetId: comment._id });
  res.json({ message: 'Deleted' });
};
