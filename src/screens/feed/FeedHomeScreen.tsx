import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { getDriverReviews } from "../../api/auth"; // 실제 API 함수로 대체

interface Review {
  reviewer: string;
  rating: number;
  createdAt: string;
}

const FeedHomeScreen = () => {
  const [reviews, setReviews] = useState<Review[]>([]); // 리뷰를 빈 배열로 초기화
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useState(new Animated.Value(0))[0];

  // 컴포넌트가 마운트될 때 리뷰 데이터를 가져오기
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getDriverReviews(1); // 실제 운전자의 ID로 대체
        const sortedReviews = response.reviews.sort((a: Review, b: Review) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ); // 날짜 기준으로 내림차순 정렬
        setReviews(sortedReviews); // 응답에서 리뷰 가져오기
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

  // 평균 별점 계산
  const calculateAverageRating = () => {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length || 0;
  };

  // 별점 아이콘 생성
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

  return (
      <View style={styles.container}>
        <Text style={styles.title}>운전자의 리뷰</Text>

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
              </View>

              <ScrollView contentContainerStyle={styles.scrollView}>
                <Animated.View style={{ opacity: fadeAnim }}>
                  {reviews.length > 0 ? (
                      reviews.map((review, index) => (
                          <View key={index} style={styles.card}>
                            <Text style={styles.reviewer}>{review.reviewer}</Text>
                            <View style={styles.rating}>{renderRatingStars(review.rating)}</View>
                            <Text style={styles.date}>
                              리뷰 작성일: {new Date(review.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                      ))
                  ) : (
                      <Text style={styles.noReviews}>리뷰가 없습니다.</Text>
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
    padding: 20,
    backgroundColor: "#f0f8ff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4b0082",
    marginBottom: 20,
    textAlign: "center",
    textShadowColor: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loading: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
    marginTop: 50,
  },
  error: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
  ratingContainer: {
    marginBottom: 20,
    backgroundColor: "#ffeb3b",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  averageRating: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textShadowColor: "#f3a2d2",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  scrollView: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  reviewer: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  rating: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filledStar: {
    color: "#ff9800",
    fontSize: 24,
  },
  emptyStar: {
    color: "#e0e0e0",
    fontSize: 24,
  },
  date: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
  },
  noReviews: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
});

export default FeedHomeScreen;
