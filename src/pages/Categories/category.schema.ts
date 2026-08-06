import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
  parent_id: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
