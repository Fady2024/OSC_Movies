export interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDistribution {
  value: number;
  count: number;
}

export interface MovieReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
  totalReviews: number;
  distribution: ReviewDistribution[];
}

export interface MyReviewResponse {
  review: Review | null;
  canReview: boolean;
  attended: boolean;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}