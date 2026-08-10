import { z } from 'zod';

export const notificationTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  status: z.coerce.number().optional(),
});

export type NotificationTypeFormValues = z.infer<typeof notificationTypeSchema>;
