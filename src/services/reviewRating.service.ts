import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import { buildUrl } from '../utils/buildUrl';
import type { ApiEnvelope, PaginatedResult } from '../types/api.types';
import type { ReviewRating, ReviewRatingListParams, SetVisibilityRequest } from '../types/reviewRating.types';

interface ReviewRatingListPayload {
  reviews: ReviewRating[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const reviewRatingService = {
  list: async (params: ReviewRatingListParams = {}): Promise<PaginatedResult<ReviewRating>> => {
    const response = await apiClient.get<ApiEnvelope<{ data: ReviewRatingListPayload; message: string }>>(
      buildUrl(API_ENDPOINTS.adminReviewRating, params),
    );
    const payload = unwrapEnvelope(response).data;
    return {
      items: payload.reviews,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      totalPages: payload.total_pages,
    };
  },

  setVisibility: async (id: number, payload: SetVisibilityRequest): Promise<void> => {
    await apiClient.patch(buildUrl(API_ENDPOINTS.adminReviewRatingVisibility, { id }), payload);
  },

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(buildUrl(API_ENDPOINTS.adminReviewRatingById, { id }));
  },
};
