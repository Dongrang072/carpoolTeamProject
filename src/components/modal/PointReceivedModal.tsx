import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface PointReceivedModalProps {
  visible: boolean;
  onClose: () => void;
  points: number; // 받은 포인트
}

function PointReceivedModal({ visible, onClose, points }: PointReceivedModalProps) {
  // 애니메이션 효과
  const scaleValue = new Animated.Value(0);

  // 모달이 열릴 때 애니메이션 시작
  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleValue, {
        toValue: 0,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
      <Modal
          animationType="fade"
          transparent={true}
          visible={visible}
          onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleValue }] }]}>
            {/* 고급스러운 아이콘 */}
            <Icon name="diamond" size={60} color="#5D3FD3" style={styles.icon} />

            {/* 받는 포인트 안내 */}
            <Text style={styles.title}>축하합니다!</Text>
            <Text style={styles.subtitle}>탑승자로부터 포인트를 받았습니다!</Text>

            {/* 포인트 강조 표시 */}
            <View style={styles.pointsContainer}>
              <Text style={styles.points}>{points}</Text>
              <Text style={styles.pointsLabel}>포인트</Text>
            </View>

            {/* 확인 버튼 */}
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>확인</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 다크한 배경
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5D3FD3',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    justifyContent: 'center',
  },
  points: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#5D3FD3', // 포인트 색상
    marginRight: 10,
  },
  pointsLabel: {
    fontSize: 22,
    color: '#5D3FD3', // 포인트 색상
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#5D3FD3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default PointReceivedModal;
