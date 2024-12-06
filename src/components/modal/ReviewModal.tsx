import React, { useState } from "react";
import { View, Modal, Text, TouchableOpacity, StyleSheet } from "react-native";
import {CreateReviewRequest, postReview} from "../../api/reviews"; // 리뷰 API 요청 함수

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  matchId: number; // 매칭 ID
  onReviewSubmitted: () => void; // 리뷰 제출 후 UI 갱신을 위한 콜백
}

const ReviewModal = ({ visible, onClose, matchId, onReviewSubmitted }: ReviewModalProps) => {
  const [rating, setRating] = useState<number>(0); // 별점 상태
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 리뷰 제출 핸들러
  const handleSubmit = async () => {
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const reviewData: CreateReviewRequest = {
        rideRequestId: matchId,
        rating: rating
      };
      // 서버로 리뷰 전송
      await postReview(reviewData);
      onReviewSubmitted(); // 리뷰 제출 후 UI 갱신
      onClose(); // 모달 닫기
      setRating(0);
    } catch (err) {
      setError("리뷰 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>리뷰 작성</Text>

            {/* 별점 선택 */}
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Text style={styles.star}>{star <= rating ? "★" : "☆"}</Text>
                  </TouchableOpacity>
              ))}
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            {/* 제출 버튼 */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.submitButtonText}>{loading ? "제출 중..." : "제출"}</Text>
            </TouchableOpacity>

            {/* 닫기 버튼 */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  );
};

// 스타일
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  star: {
    fontSize: 40,
    margin: 5,
    color: "#FFD700",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: "#999",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default ReviewModal;
