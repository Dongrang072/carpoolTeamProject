import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Animated } from "react-native";
import { getAllReviews } from "../../api/reviews"; // API 함수 수정 필요

interface Review {
  reviewer: string;
  target: string;
  rating: number;
  createdAt: string;
}

const FeedHomeScreen = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getAllReviews();
        const sortedReviews = response.reviews.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setReviews(sortedReviews);
      } catch (err) {
        console.error("리뷰 가져오기 오류:", err);
        setError("리뷰를 가져오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
          <Text key={i} style={i <= rating ? styles.filledStar : styles.emptyStar}>
            ★
          </Text>
      );
    }
    return stars;
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>전체 리뷰</Text>

        {loading ? (
            <Text style={styles.loading}>리뷰를 불러오는 중...</Text>
        ) : error ? (
            <Text style={styles.error}>{error}</Text>
        ) : (
            <>
              <View style={styles.ratingContainer}>
                <Text style={styles.averageRating}>
                  평균 별점: {calculateAverageRating().toFixed(1)}⭐
                </Text>
                <Text style={styles.totalReviews}>
                  전체 리뷰 수: {reviews.length}개
                </Text>
              </View>

              <ScrollView contentContainerStyle={styles.scrollView}>
                <Animated.View style={{ opacity: fadeAnim }}>
                  {reviews.length > 0 ? (
                      reviews.map((review, index) => (
                          <View key={index} style={styles.card}>
                            <View style={styles.userInfo}>
                              <Text style={styles.reviewer}>작성자: {review.reviewer}</Text>
                              <Text style={styles.target}>드라이버: {review.target}</Text>
                            </View>
                            <View style={styles.rating}>
                              {renderRatingStars(review.rating)}
                            </View>
                            <Text style={styles.date}>
                              {formatDate(review.createdAt)}
                            </Text>
                          </View>
                      ))
                  ) : (
                      <Text style={styles.noReviews}>아직 작성된 리뷰가 없습니다.</Text>
                  )}
                </Animated.View>
              </ScrollView>
            </>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  loading: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
  error: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginTop: 40,
  },
  ratingContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  averageRating: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  totalReviews: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  scrollView: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    marginBottom: 8,
  },
  reviewer: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  target: {
    fontSize: 16,
    color: "#666",
  },
  rating: {
    flexDirection: "row",
    marginVertical: 8,
  },
  filledStar: {
    color: "#ffc107",
    fontSize: 20,
  },
  emptyStar: {
    color: "#e0e0e0",
    fontSize: 20,
  },
  date: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  noReviews: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
  },
});

export default FeedHomeScreen;
