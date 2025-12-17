export const canEditPost = (user, post) => {
  if (!user) return { allowed: false, code: 401 };
  if (user.role === 'admin') return { allowed: false, code: 403 };
  return { allowed: post.authorId.toString() === user._id.toString(), code: 403 };
};

export const canDeletePost = (user, post) => {
  if (!user) return { allowed: false, code: 401 };
  if (user.role === 'admin') return { allowed: true };
  return { allowed: post.authorId.toString() === user._id.toString(), code: 403 };
};

export const canEditComment = (user, comment) => {
  if (!user) return { allowed: false, code: 401 };
  if (user.role === 'admin') return { allowed: false, code: 403 };
  return { allowed: comment.authorId.toString() === user._id.toString(), code: 403 };
};

export const canDeleteComment = (user, comment) => {
  if (!user) return { allowed: false, code: 401 };
  if (user.role === 'admin') return { allowed: true };
  return { allowed: comment.authorId.toString() === user._id.toString(), code: 403 };
};
