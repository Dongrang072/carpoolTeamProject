import axiosInstance from "./axios";
import {AxiosError} from "axios";
import {ApiError} from "../utils/api-error";

interface CreateReviewRequest {
  rideRequestId: number;
  rating: number;
}

interface ReviewResponse {
  message: string;
}

interface Review {
  reviewer: string;
  target: string;
  rating: number;
  createdAt: string;
}

interface GetAllReviewsResponse {
  reviews: Review[];
  totalCount: number;
  averageRating: number;
}

const postReview = async ({rideRequestId, rating}: CreateReviewRequest): Promise<ReviewResponse> => {
  try {
    console.log("postReview - Request:", {
      method: "POST",
      data: {rideRequestId, rating}
    });

    const {data} = await axiosInstance.post('/reviews', {
      rideRequestId,
      rating
    });

    console.log("Review submission response:", data);
    return data;

  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiError;
      console.error("리뷰 제출 에러:", {
        requestData: {rideRequestId, rating},
        error: errorData || error.message
      });
      throw new Error(errorData?.message || error.message || '리뷰 제출에 실패했습니다.');
    }
    throw error;
  }
};


const getAllReviews = async (): Promise<GetAllReviewsResponse> => {
  try {
    console.log("getAllReviews - Request");

    const {data} = await axiosInstance.get('/reviews/all');

    console.log("Get all reviews response:", data);
    return data;

  } catch (error) {
    if (error instanceof AxiosError) {
      const errorData = error.response?.data as ApiError;
      console.error("전체 리뷰 조회 에러:", {
        error: errorData || error.message
      });
      throw new Error(errorData?.message || error.message || '리뷰 조회에 실패했습니다.');
    }
    throw error;
  }
};


export {postReview, getAllReviews};
export type {CreateReviewRequest, ReviewResponse, Review, GetAllReviewsResponse};
