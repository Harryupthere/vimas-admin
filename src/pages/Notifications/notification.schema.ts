import { z } from 'zod';

export const sendNotificationSchema = z
  .object({
    target: z.enum(['single', 'broadcast']),
    userId: z.string().optional(),
    notificationCategoryId: z.string().min(1, 'Category is required'),
    notificationTypeId: z.string().min(1, 'Type is required'),
    heading: z.string().min(1, 'Heading is required'),
    subheading: z.string().optional(),
    route: z.string().optional(),
    dataJson: z.string().optional(),
  })
  .refine((values) => values.target !== 'single' || !!values.userId?.trim(), {
    message: 'User ID is required for a single-user notification',
    path: ['userId'],
  })
  .refine(
    (values) => {
      if (!values.dataJson || !values.dataJson.trim()) return true;
      try {
        const parsed = JSON.parse(values.dataJson);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid JSON object, e.g. {"orderId": 12}', path: ['dataJson'] },
  );

export type SendNotificationFormValues = z.infer<typeof sendNotificationSchema>;

export const editNotificationSchema = z
  .object({
    heading: z.string().min(1, 'Heading is required'),
    subheading: z.string().optional(),
    route: z.string().optional(),
    dataJson: z.string().optional(),
  })
  .refine(
    (values) => {
      if (!values.dataJson || !values.dataJson.trim()) return true;
      try {
        const parsed = JSON.parse(values.dataJson);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid JSON object, e.g. {"orderId": 12}', path: ['dataJson'] },
  );

export type EditNotificationFormValues = z.infer<typeof editNotificationSchema>;
