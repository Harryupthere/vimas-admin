import { z } from 'zod';

export const membershipTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  key_points: z.string().optional(), // one per line, split on submit
  colour: z.string().optional(),
  points_required: z.coerce.number().min(0).optional(),
});

export type MembershipTypeFormValues = z.infer<typeof membershipTypeSchema>;
