import Comment from '../models/Comment.js';
import CommentVote from '../models/CommentVote.js';
import sanitizeHtml from 'sanitize-html';
import { canEditComment, canDeleteComment } from '../lib/policy.js';

export const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Content is required' });
  }

  // Basic rate limiting could go here (e.g. check last comment time)

  const cleanContent = sanitizeHtml(content.trim());

  const comment = await Comment.create({
    postId,
    authorId: req.user._id,
    content: cleanContent,
  });

  await comment.populate('authorId', 'nickname avatarId avatarUrl');

  res.status(201).json(comment);
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { postId, status: 'active' };

  const comments = await Comment.find(query)
    .sort({ createdAt: -1 }) // Newest first
    .skip(Number(skip))
    .limit(Number(limit))
    .populate('authorId', 'nickname avatarId avatarUrl');

  const total = await Comment.countDocuments(query);

  // If user is logged in, fetch their votes for these comments
  let commentsWithVotes = comments.map(c => c.toObject());
  if (req.user) {
    const commentIds = comments.map(c => c._id);
    const votes = await CommentVote.find({
      commentId: { $in: commentIds },
      userId: req.user._id
    });

    const voteMap = votes.reduce((acc, v) => {
      acc[v.commentId.toString()] = v.value;
      return acc;
    }, {});

    commentsWithVotes = commentsWithVotes.map(c => ({
      ...c,
      myVote: voteMap[c._id.toString()] || 0
    }));
  }

  res.json({
    comments: commentsWithVotes,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total
  });
};

export const updateComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  const perm = canEditComment(req.user, comment);
  if (!perm.allowed) return res.status(perm.code || 403).json({ message: 'Forbidden' });

  const content = req.body.content;
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Content is required' });
  }

  comment.content = sanitizeHtml(content.trim());
  await comment.save();
  await comment.populate('authorId', 'nickname avatarId avatarUrl');
  res.json(comment);
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  const perm = canDeleteComment(req.user, comment);
  if (!perm.allowed) return res.status(perm.code || 403).json({ message: 'Forbidden' });

  comment.status = 'deleted';
  comment.deletedAt = new Date();
  comment.deletedBy = req.user._id;
  await comment.save();

  res.json({ message: 'Deleted' });
};

export const voteComment = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body; // 1 or -1
  const userId = req.user._id;

  if (![1, -1].includes(value)) {
    return res.status(400).json({ message: 'Invalid vote value' });
  }

  const comment = await Comment.findById(id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });

  const existingVote = await CommentVote.findOne({ commentId: id, userId });

  let newVoteValue = 0; // 0 means no vote

  if (existingVote) {
    if (existingVote.value === value) {
      // Toggle off
      await existingVote.deleteOne();
      newVoteValue = 0;
      // Update counts
      if (value === 1) {
        comment.voteCounts.likes = Math.max(0, comment.voteCounts.likes - 1);
      } else {
        comment.voteCounts.dislikes = Math.max(0, comment.voteCounts.dislikes - 1);
      }
    } else {
      // Change vote
      // Remove old effect
      if (existingVote.value === 1) {
        comment.voteCounts.likes = Math.max(0, comment.voteCounts.likes - 1);
      } else {
        comment.voteCounts.dislikes = Math.max(0, comment.voteCounts.dislikes - 1);
      }
      // Apply new effect
      existingVote.value = value;
      await existingVote.save();
      newVoteValue = value;

      if (value === 1) {
        comment.voteCounts.likes += 1;
      } else {
        comment.voteCounts.dislikes += 1;
      }
    }
  } else {
    // New vote
    await CommentVote.create({ commentId: id, userId, value });
    newVoteValue = value;

    if (value === 1) {
      comment.voteCounts.likes += 1;
    } else {
      comment.voteCounts.dislikes += 1;
    }
  }

  comment.voteCounts.score = comment.voteCounts.likes - comment.voteCounts.dislikes;
  await comment.save();

  res.json({
    myVote: newVoteValue,
    counts: comment.voteCounts
  });
};
