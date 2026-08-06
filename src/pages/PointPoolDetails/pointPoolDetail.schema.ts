import { z } from 'zod';
import { POINT_POOL_DETAIL_TYPES } from '../../types/pointPoolDetail.types';

export const pointPoolDetailSchema = z.object({
  type: z.enum(POINT_POOL_DETAIL_TYPES as [string, ...string[]]),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  symbol: z.string().optional(),
  colour: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type PointPoolDetailFormValues = z.infer<typeof pointPoolDetailSchema>;
