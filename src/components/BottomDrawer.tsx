import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {colors} from '../constants';
import type {StationLocation} from '../constants/stationlocations';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PricingHelpModal from '../components/PricingHelpModal';

interface BottomDrawerProps {
  isVisible: boolean;
  startPoint: number | null;
  endPoint: number | null;
  stations: StationLocation[];
  onSelectStation: (type: 'start' | 'end') => void;
  onCancel: () => void;
  closeDrawer: () => void;
  onMatchStart: () => void;
  isMatching: boolean; // 매칭 상태 prop 추가
  isMatched: boolean;
  isRiding: boolean;
  onNavigateToChat: () => void;
  onAgreeMatch: () => void;
  onCompleteMatch: () => void;
  role: 'driver' | 'passenger' | undefined;
}
//isRiding 추가
function BottomDrawer({
                        isVisible,
                        startPoint,
                        endPoint,
                        stations,
                        onSelectStation,
                        onCancel,
                        closeDrawer,
                        onMatchStart,
                        isMatching,
                        isMatched,
                        isRiding,
                        onNavigateToChat,
                        onAgreeMatch,
                        onCompleteMatch,
                        role,
                      }: BottomDrawerProps) {
  if (!isVisible) return null;

  const inset = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState('');
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false); //모달 상태

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setCurrentTime(formattedTime);
    };

    // 초기 설정
    updateCurrentTime();

    // 1분마다 시간 업데이트
    const interval = setInterval(updateCurrentTime, 60000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval);
  }, []);

  return (
      <>
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={closeDrawer}>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>경로 입력</Text>
              {/* 도움말 버튼 */}
              <Pressable
                  onPress={() => setIsHelpModalVisible(true)}
                  style={styles.helpButton}>
                <Text style={styles.helpButtonText}>?</Text>
              </Pressable>
            </View>
            <View style={styles.content}>
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>매칭 요청 시간: </Text>
                <Text style={styles.timeValue}>{currentTime}</Text>
              </View>

              <View style={styles.locationSection}>
                <Pressable
                    style={styles.locationButton}
                    onPress={() => onSelectStation('start')}>
                  <Text style={styles.locationLabel}>출발</Text>
                  <Text style={styles.locationValue}>
                    {startPoint !== null
                        ? stations[startPoint].stationName
                        : '선택하세요'}
                  </Text>
                </Pressable>

                <Pressable
                    style={styles.locationButton}
                    onPress={() => onSelectStation('end')}>
                  <Text style={styles.locationLabel}>도착</Text>
                  <Text style={styles.locationValue}>
                    {endPoint !== null
                        ? stations[endPoint].stationName
                        : '선택하세요'}
                  </Text>
                </Pressable>
              </View>

              {isRiding ? (
                  <View style={styles.newActionButtons}>
                    <Pressable style={styles.chatButton} onPress={onNavigateToChat}>
                      <Text style={styles.chatButtonText}>채팅창으로 돌아가기</Text>
                    </Pressable>
                    <Pressable
                        style={[
                          styles.agreeButton,
                          role === 'passenger' && styles.disabledButton
                        ]}
                        onPress={onCompleteMatch}
                        disabled={role === 'passenger'}
                    >
                      <Text
                          style={[
                            styles.agreeButtonText,
                            role === 'passenger' && styles.disabledButtonText
                          ]}
                      >
                        {role === 'driver' ? '운행 완료' : '운행 중'}
                      </Text>
                    </Pressable>
                  </View>
              ):isMatched ? (
                  <View style={styles.newActionButtons}>
                    <Pressable
                        style={styles.chatButton}
                        onPress={onNavigateToChat}>
                      <Text style={styles.chatButtonText}>채팅창으로 이동</Text>
                    </Pressable>
                    <Pressable
                        style={styles.agreeButton}
                        onPress={onAgreeMatch}>
                      <Text style={styles.agreeButtonText}>
                        {role === 'driver' ? '운행 시작' : '탑승 완료'}
                      </Text>
                    </Pressable>
                  </View>
              ) : (
                  <View style={styles.actionButtons}>
                    <Pressable
                        style={[
                          styles.matchButton,
                          isMatching && styles.matchingButton,
                        ]}
                        onPress={onMatchStart}>
                      <Text style={styles.matchButtonText}>
                        {isMatching ? '매칭 중입니다' : '매칭 시작하기'}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.cancelButton} onPress={onCancel}>
                      <Text style={styles.cancelButtonText}>
                        {isMatching ? '매칭 취소하기' : '돌아가기'}
                      </Text>
                    </Pressable>
                  </View>
              )}
            </View>
          </View>
        </Modal>

        {/* 도움말 모달 */}
        <PricingHelpModal
            visible={isHelpModalVisible}
            onClose={() => setIsHelpModalVisible(false)}
            startPoint={startPoint !== null ? stations[startPoint].stationName : null}
            endPoint={endPoint !== null ? stations[endPoint].stationName : null}
        />
      </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.GRAY_300,
    flexDirection: 'row', // 도움말 버튼 일렬로 정렬
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationSection: {
    gap: 12,
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.GRAY_200,
    borderRadius: 8,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    width: 40,
  },
  locationValue: {
    fontSize: 16,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  matchButton: {
    flex: 1,
    backgroundColor: colors.BLUE_500,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  matchButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.RED_500,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchingButton: {
    backgroundColor: colors.GRAY_500,
  },
  helpButton: { // 도움말 버튼 디자인
    backgroundColor: colors.BLUE_500,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  helpButtonText: {
    color: colors.WHITE,
    fontWeight: 'bold',
  },
  newActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  chatButton: {
    flex: 1,
    backgroundColor: colors.BLUE_500,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  chatButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  agreeButton: {
    flex: 1,
    backgroundColor: colors.BLUE_500,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  agreeButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: colors.GRAY_300,
    opacity: 0.7,
  },
  disabledButtonText: {
    color: colors.WHITE,
  },
});

export default BottomDrawer;
