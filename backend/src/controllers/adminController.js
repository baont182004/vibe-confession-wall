import mongoose from 'mongoose';
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

const parseObjectId = (value) => {
  if (!value) return null;
  try {
    return new mongoose.Types.ObjectId(value);
  } catch {
    return null;
  }
};

export const listPosts = async (req, res) => {
  const pageNumber = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const filters = {};
  if (req.query.q) {
    filters.content = { $regex: req.query.q.substring(0, 100), $options: 'i' };
  }
  if (req.query.author) {
    const authorId = parseObjectId(req.query.author);
    if (authorId) {
      filters.authorId = authorId;
    }
  }
  if (req.query.status) {
    filters.status = req.query.status;
  } else {
    filters.status = { $ne: 'deleted' };
  }

  const totalItems = await Post.countDocuments(filters);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(pageNumber, totalPages);
  const skip = (safePage - 1) * pageSize;

  const posts = await Post.aggregate([
    { $match: filters },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        as: 'authorDoc',
      },
    },
    { $unwind: { path: '$authorDoc', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'comments',
        let: { postId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$postId', '$$postId'] }, { $ne: ['$status', 'deleted'] }] } } },
          { $count: 'count' },
        ],
        as: 'commentMeta',
      },
    },
    {
      $addFields: {
        commentCount: { $ifNull: [{ $arrayElemAt: ['$commentMeta.count', 0] }, 0] },
        authorId: '$authorDoc',
      },
    },
    { $project: { commentMeta: 0, authorDoc: 0 } },
    { $skip: skip },
    { $limit: pageSize },
  ]);

  res.json({
    items: posts,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
  });
};

export const deletePostAdmin = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.status = 'deleted';
  await post.save();
  await Comment.updateMany(
    { postId: post._id, status: { $ne: 'deleted' } },
    { status: 'deleted', deletedAt: new Date(), deletedBy: req.user._id }
  );
  await AdminAudit.create({ adminId: req.user._id, action: 'delete_post', targetType: 'Post', targetId: post._id });
  res.json({ ok: true, deletedId: post._id });
};

export const listComments = async (req, res) => {
  const pageNumber = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const filters = {};
  if (req.query.q) {
    filters.content = { $regex: req.query.q.substring(0, 100), $options: 'i' };
  }
  if (req.query.postId) {
    const linkedPostId = parseObjectId(req.query.postId);
    if (linkedPostId) {
      filters.postId = linkedPostId;
    }
  }
  if (req.query.status) {
    filters.status = req.query.status;
  } else {
    filters.status = { $ne: 'deleted' };
  }

  const totalItems = await Comment.countDocuments(filters);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(pageNumber, totalPages);
  const skip = (safePage - 1) * pageSize;

  const comments = await Comment.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .populate('authorId', 'nickname avatarId')
    .populate({
      path: 'postId',
      select: 'content authorId',
      populate: { path: 'authorId', select: 'nickname' },
    });

  res.json({
    items: comments,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
  });
};

export const deleteCommentAdmin = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  comment.status = 'deleted';
  comment.deletedAt = new Date();
  comment.deletedBy = req.user._id;
  await comment.save();
  await AdminAudit.create({ adminId: req.user._id, action: 'delete_comment', targetType: 'Comment', targetId: comment._id });
  res.json({ ok: true, deletedId: comment._id });
};
