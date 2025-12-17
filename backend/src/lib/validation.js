
import { z } from 'zod';

export const emailSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
  }),
});

export const postSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(2000),
    tags: z.array(z.string()).optional(),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(500),
  }),
});

export const profileSchema = z.object({
  body: z.object({
    nickname: z.string().min(2).max(30).regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric only"),
    avatarId: z.number().int().min(1).max(100),
  }),
});

export const reportSchema = z.object({
  body: z.object({
    targetType: z.enum(['Post', 'Comment', 'ChatMessage']),
    targetId: z.string(),
    reason: z.string().min(3),
  }),
});

// Middleware helper
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    return res.status(400).json({ errors: err.errors });
  }
};

export const changeUsernameSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3)
      .max(20)
      .trim()
      .regex(/^[A-Za-z0-9._]+$/),
  }),
});

export const changeNicknameSchema = z.object({
  body: z.object({
    nickname: z.string()
      .min(3)
      .max(20)
      .refine((value) => value === value.trim(), {
        message: 'Nickname cannot start or end with spaces',
      }),
  }),
});

export const changeAvatarSchema = z.object({
  body: z.object({
    avatarId: z.coerce.number().int().min(1).max(100).optional(),
    avatarKey: z.string().min(1).optional(),
    avatarUrl: z.string().min(1).optional(),
  }).refine((data) => data.avatarId || data.avatarUrl || data.avatarKey, {
    message: 'Avatar selection is required',
  }),
});

export const changeAvatarDefaultSchema = z.object({
  body: z.object({
    avatarUrl: z.string().min(1),
  }),
});
