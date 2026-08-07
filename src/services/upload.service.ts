import axios from 'axios';
import { apiClient, unwrapEnvelope } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { ApiEnvelope } from '../types/api.types';

export interface PresignedUrlResponse {
  /** Presigned S3 PUT URL — expires in 5 minutes (Backend/src/upload/upload.service.ts). */
  uploadUrl: string;
  /** Permanent CloudFront URL — this is what gets stored as media_url once the upload completes. */
  fileUrl: string;
}

export const uploadService = {
  // POST /upload/presigned-url returns { uploadUrl, fileUrl } directly (no
  // { data, message } wrapper around it) — only the global interceptor layer
  // applies, so unwrapEnvelope() alone is the full payload here.
  getPresignedUrl: async (filename: string, fileType: string): Promise<PresignedUrlResponse> => {
    const response = await apiClient.post<ApiEnvelope<PresignedUrlResponse>>(API_ENDPOINTS.uploadPresignedUrl, {
      filename,
      fileType,
    });
    return unwrapEnvelope(response);
  },

  // Uploads straight to S3 with the presigned URL. Deliberately bypasses
  // `apiClient`: this request must NOT carry our Authorization header (S3
  // rejects unexpected auth on a presigned request) and the body is raw
  // file bytes, not JSON — the request/response interceptors on apiClient
  // assume both of those.
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    });
  },
};
