import { z } from 'zod';

export const registrationTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.coerce.number().optional(),
});

export type RegistrationTypeFormValues = z.infer<typeof registrationTypeSchema>;
