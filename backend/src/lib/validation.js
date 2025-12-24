
import { z } from 'zod';
import { format, isValid, parse } from 'date-fns';

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
    avatarId: z.number().int().min(1).max(31),
  }),
});

export const reportSchema = z.object({
  body: z.object({
    targetType: z.enum(['Post', 'Comment']),
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
    avatarId: z.coerce.number().int().min(1).max(31),
  }),
});

export const updateTimezoneSchema = z.object({
  body: z.object({
    timezone: z.string().min(1),
  }),
});

export const updateProfileNoteSchema = z.object({
  body: z.object({
    profileNote: z.string().max(160),
  }),
});

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_KEY_FORMAT = 'yyyy-MM-dd';

export const validateDateKey = (value) => {
  if (typeof value !== 'string' || !DATE_KEY_REGEX.test(value)) {
    return {
      code: 'INVALID_DATE_KEY',
      message: 'dateKey must be YYYY-MM-DD.',
    };
  }
  const parsed = parse(value, DATE_KEY_FORMAT, new Date());
  if (!isValid(parsed)) {
    return {
      code: 'INVALID_DATE_KEY',
      message: 'dateKey must be YYYY-MM-DD.',
    };
  }
  if (format(parsed, DATE_KEY_FORMAT) !== value) {
    return {
      code: 'INVALID_DATE_KEY',
      message: 'dateKey must be YYYY-MM-DD.',
    };
  }
  return null;
};

export const validateJournalContent = (value, maxLength = 10000) => {
  if (typeof value !== 'string') {
    return {
      code: 'INVALID_CONTENT',
      message: `content is required and must be <= ${maxLength} chars.`,
    };
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    return {
      code: 'INVALID_CONTENT',
      message: `content is required and must be <= ${maxLength} chars.`,
    };
  }
  return null;
};

const weekIdSchema = z.string().regex(/^\d{4}-W\d{2}$/).optional();
const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/);
const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const addWeeklyItemSchema = z.object({
  body: z.object({
    weekId: weekIdSchema,
    text: z.string().min(1).max(200),
    startTime: timeStringSchema.optional(),
    endTime: timeStringSchema.optional(),
    dateKey: dateKeySchema.optional(),
  }),
});

export const updateWeeklyItemSchema = z.object({
  body: z.object({
    weekId: weekIdSchema,
    text: z.string().min(1).max(200).optional(),
    startTime: timeStringSchema.optional().nullable(),
    endTime: timeStringSchema.optional().nullable(),
    dateKey: dateKeySchema.optional().nullable(),
    completed: z.boolean().optional(),
  }),
});

export const closeWeeklyPlanSchema = z.object({
  body: z.object({
    weekId: weekIdSchema,
  }),
});
