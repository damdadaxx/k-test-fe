import { z } from 'zod';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Enter your Email')
    .regex(EMAIL_PATTERN, 'Invalid email address'),
  password: z
    .string()
    .min(1, 'Enter your password')
    .min(8, 'Incorrect password'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
