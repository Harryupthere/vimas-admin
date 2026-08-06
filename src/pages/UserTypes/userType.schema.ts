import { z } from 'zod';

export const userTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  key_points: z.string().optional(), // one per line, split on submit
  status: z.coerce.number().optional(),
});

export type UserTypeFormValues = z.infer<typeof userTypeSchema>;
