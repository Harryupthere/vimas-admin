import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150, 'Name must be under 150 characters'),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
