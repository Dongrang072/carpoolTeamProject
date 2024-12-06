import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { colors } from '../constants';

// 가격 데이터 정의
export const pricingData = [
  { departure: '명지대 자연캠퍼스', destination: '명지대역', distance: 1.6, price: [4800, 4320, 4080, 3840, 3360, 2880] },
  { departure: '명지대역', destination: '명지대 자연캠퍼스', distance: 1.6, price: [4800, 4320, 4080, 3840, 3360, 2880] },

  { departure: '용인공용버스터미널', destination: '명지대역', distance: 2.5, price: [5500, 4950, 4675, 4400, 3849, 3300] },
  { departure: '명지대역', destination: '용인공용버스터미널', distance: 2.5, price: [5500, 4950, 4675, 4400, 3849, 3300] },

  { departure: '명지대 자연캠퍼스', destination: '용인공용버스터미널', distance: 2.9, price: [5900, 5310, 5015, 4720, 4130, 3540] },
  { departure: '용인공용버스터미널', destination: '명지대 자연캠퍼스', distance: 2.9, price: [5900, 5310, 5015, 4720, 4130, 3540] },

  { departure: '기흥역', destination: '동백역', distance: 4.6, price: [7400, 6660, 6290, 5920, 5180, 4440] },
  { departure: '동백역', destination: '기흥역', distance: 4.6, price: [7400, 6660, 6290, 5920, 5180, 4440] },

  { departure: '명지대역', destination: '동백역', distance: 5.8, price: [8600, 7740, 7310, 6880, 6020, 5160] },
  { departure: '동백역', destination: '명지대역', distance: 5.8, price: [8600, 7740, 7310, 6880, 6020, 5160] },

  { departure: '동백역', destination: '명지대 자연캠퍼스', distance: 7.5, price: [10200, 9180, 8670, 8160, 7140, 6120] },
  { departure: '명지대 자연캠퍼스', destination: '동백역', distance: 7.5, price: [10200, 9180, 8670, 8160, 7140, 6120] },

  { departure: '용인공용버스터미널', destination: '동백역', distance: 8.4, price: [11500, 10350, 9775, 9200, 8049, 6900] },
  { departure: '동백역', destination: '용인공용버스터미널', distance: 8.4, price: [11500, 10350, 9775, 9200, 8049, 6900] },

  { departure: '기흥역', destination: '명지대 자연캠퍼스', distance: 9.2, price: [11800, 10620, 10030, 9440, 8260, 7080] },
  { departure: '명지대 자연캠퍼스', destination: '기흥역', distance: 9.2, price: [11800, 10620, 10030, 9440, 8260, 7080] },

  { departure: '기흥역', destination: '명지대역', distance: 9.7, price: [12900, 11610, 10965, 10320, 9030, 7740] },
  { departure: '명지대역', destination: '기흥역', distance: 9.7, price: [12900, 11610, 10965, 10320, 9030, 7740] },

  { departure: '용인공용버스터미널', destination: '명지대역', distance: 14.0, price: [16700, 15030, 14195, 13360, 11690, 10020] },
  { departure: '기흥역', destination: '용인공용버스터미널', distance: 14.0, price: [16700, 15030, 14195, 13360, 11690, 10020] }
];

const PricingHelpModal: React.FC<{ visible: boolean; onClose: () => void; startPoint: string | null; endPoint: string | null }> = ({ visible, onClose, startPoint, endPoint }) => {
  const [filteredData, setFilteredData] = useState<{
    departure: string;
    destination: string;
    distance: number;
    price: number[];
  } | null>(null);

  useEffect(() => {
    if (startPoint && endPoint) {
      const matchedData = pricingData.find(
          (item) =>
              item.departure.trim().toLowerCase() === startPoint.trim().toLowerCase() &&
              item.destination.trim().toLowerCase() === endPoint.trim().toLowerCase()
      );
      setFilteredData(matchedData || null);
    } else {
      setFilteredData(null);
    }
  }, [startPoint, endPoint]);

  return (
      <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>거리별 인원수별 가격 안내</Text>

            {filteredData ? (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableCell}>출발지</Text>
                    <Text style={styles.tableCell}>목적지</Text>
                    <Text style={styles.tableCell}>거리(km)</Text>
                    <Text style={styles.tableCell}>1인</Text>
                    <Text style={styles.tableCell}>2인</Text>
                    <Text style={styles.tableCell}>3인</Text>
                    <Text style={styles.tableCell}>4인</Text>
                    <Text style={styles.tableCell}>5인</Text>
                    <Text style={styles.tableCell}>6인</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{filteredData.departure}</Text>
                    <Text style={styles.tableCell}>{filteredData.destination}</Text>
                    <Text style={styles.tableCell}>{filteredData.distance} km</Text>
                    {filteredData.price.map((price, index) => (
                        <Text key={index} style={styles.tableCell}>{price} ₩</Text>
                    ))}
                  </View>
                </>
            ) : (
                <Text>해당 경로의 가격 정보가 없습니다.</Text>
            )}

            {/* 닫기 버튼 */}
            <Pressable
                style={styles.closeButton}
                onPress={onClose}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: colors.BLUE_500,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PricingHelpModal;
