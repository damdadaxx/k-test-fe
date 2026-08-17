import { z } from 'zod';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const requiredAgreement = z
  .boolean()
  .refine((value) => value === true, { message: 'Required' });

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(EMAIL_PATTERN, 'Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  birthDate: z.string().min(1, 'Date of birth is required'),
  idType: z.enum(['PASSPORT', 'ARC']),
  idNumber: z.string().min(1, 'Passport number is required'),
  companyCode: z.string().optional(),
  agreedToTerms: requiredAgreement,
  agreedToPrivacyPolicy: requiredAgreement,
  agreedToPassportProcessing: requiredAgreement,
  agreedToVoiceDataAiTraining: z.boolean().optional(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
