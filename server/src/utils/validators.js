const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(8),
  college: z.string().min(2),
  campus: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  college: z.string().min(2),
  campus: z.string().optional(),
});

const itemSchema = z.object({
  type: z.enum(['found', 'lost']),
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  location: z.string().min(2),
  date: z.coerce.date(),
  images: z.array(z.string()).optional(),
  urgent: z.boolean().optional(),
  contactPreference: z.enum(['both', 'email', 'phone']).optional(),
  campus: z.string().optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  itemSchema,
};
