import { z } from 'zod';
import { POINT_EVENT_TYPES, POINT_RECEIVER_TYPES } from '../../types/pointDistribution.types';

export const pointDistributionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  symbol: z.string().optional(),
  colour: z.string().optional(),
  eventType: z.enum(POINT_EVENT_TYPES as [string, ...string[]]),
  receiverType: z.enum(POINT_RECEIVER_TYPES as [string, ...string[]]),
  pointsPercentage: z.coerce.number().min(0, 'Must be 0-100').max(100, 'Must be 0-100'),
  priority: z.coerce.number().int().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type PointDistributionFormValues = z.infer<typeof pointDistributionSchema>;
