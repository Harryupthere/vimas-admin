import { z } from 'zod';

export const notificationCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  status: z.coerce.number().optional(),
  userPreference: z.boolean().optional(),
});

export type NotificationCategoryFormValues = z.infer<typeof notificationCategorySchema>;
