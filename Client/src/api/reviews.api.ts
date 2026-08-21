import { apiClient } from "./client";
import type {
  MovieReviewsResponse,
  MyReviewResponse,
  Review,
  ReviewFormData,
} from "@/types/review.types";

export async function getMovieReviews(
  movieId: string,
  page = 1,
  limit = 10
): Promise<MovieReviewsResponse> {
  const { data: res } = await apiClient.get(`/movies/${movieId}/reviews`, {
    params: { page, limit },
  });
  return res;
}

export async function getMyReview(movieId: string): Promise<MyReviewResponse> {
  const { data: res } = await apiClient.get(`/movies/${movieId}/reviews/me`);
  return res;
}

export async function createReview(
  movieId: string,
  data: ReviewFormData
): Promise<Review> {
  const { data: res } = await apiClient.post(`/movies/${movieId}/reviews`, data);
  return res.data;
}

export async function updateReview(
  reviewId: string,
  data: Partial<ReviewFormData>
): Promise<Review> {
  const { data: res } = await apiClient.patch(`/reviews/${reviewId}`, data);
  return res.data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/reviews/${reviewId}`);
}