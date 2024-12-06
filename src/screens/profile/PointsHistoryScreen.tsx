import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import ReviewModal from '../../../../carpoolTeamProject/src/components/modal/ReviewModal';
import PointReceivedModal from '../../../../carpoolTeamProject/src/components/modal/PointReceivedModal'; // PointReceivedModal import

function PointsHistoryScreen() {
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isPointModalVisible, setIsPointModalVisible] = useState(false); // 포인트 모달 상태

  const openReviewModal = () => {
    setIsReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalVisible(false);
  };

  const openPointModal = () => {
    setIsPointModalVisible(true); // 포인트 모달 열기
  };

  const closePointModal = () => {
    setIsPointModalVisible(false); // 포인트 모달 닫기
  };

  return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>포인트 내역</Text>
        <View style={styles.contentContainer}>
          {/* 기존 포인트 내역 관련 UI */}
          <Text style={styles.contentText}>여기에 포인트 내역이 표시됩니다.</Text>
        </View>

        {/* 리뷰 모달 버튼 */}
        <Pressable style={styles.button} onPress={openReviewModal}>
          <Text style={styles.buttonText}>리뷰 작성하기</Text>
        </Pressable>

        {/* 포인트 모달 버튼 */}
        <Pressable style={[styles.button, styles.pointButton]} onPress={openPointModal}>
          <Text style={styles.buttonText}>포인트 받기 모달 보기</Text>
        </Pressable>

        {/*/!* 리뷰 모달 *!/*/}
        {/*<ReviewModal visible={isReviewModalVisible} onClose={closeReviewModal}  matchId={}/>*/}

        {/* 포인트 수령 모달 */}
        <PointReceivedModal
            visible={isPointModalVisible}
            onClose={closePointModal}
            points={100} // 예시 포인트 값
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointButton: {
    backgroundColor: '#4CAF50', // 포인트 버튼은 녹색으로 구분
  },
});

export default PointsHistoryScreen;
