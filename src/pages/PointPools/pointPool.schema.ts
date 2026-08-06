import { z } from 'zod';
import { POINT_POOL_STATUSES } from '../../types/pointPool.types';

export const pointPoolSchema = z.object({
  poolDetailId: z.string().min(1, 'Pool detail is required'),
  fromDatetime: z.string().min(1, 'Start date/time is required'),
  toDatetime: z.string().min(1, 'End date/time is required'),
  totalUsers: z.coerce.number().int().optional(),
  totalAdmins: z.coerce.number().int().optional(),
  totalCredit: z.coerce.number().optional(),
  totalDebit: z.coerce.number().optional(),
  currentBalance: z.coerce.number().optional(),
  distributedPoints: z.coerce.number().optional(),
  status: z.enum(POINT_POOL_STATUSES as [string, ...string[]]).optional(),
});

export type PointPoolFormValues = z.infer<typeof pointPoolSchema>;
