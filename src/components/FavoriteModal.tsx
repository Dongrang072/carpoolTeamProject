import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';

type FavoriteModalProps = {
  visible: boolean;
  onClose: () => void;
  favorites: { id: string; startPoint: string; endPoint: string }[];
  onAddFavorite: (startPoint: string, endPoint: string) => void;
  onSelect: (startPoint: string, endPoint: string) => void;
  onDeleteFavorite: (id: string) => void;
};

const FavoriteModal: React.FC<FavoriteModalProps> = ({
                                                       visible,
                                                       onClose,
                                                       favorites,
                                                       onAddFavorite,
                                                       onSelect,
                                                       onDeleteFavorite,
                                                     }) => {
  const [selectedStartPoint, setSelectedStartPoint] = useState<string | null>(null);
  const [selectedEndPoint, setSelectedEndPoint] = useState<string | null>(null);
  const [showStartPoints, setShowStartPoints] = useState(false);
  const [showEndPoints, setShowEndPoints] = useState(false);

  const startPoints = ['명지대 자연캠퍼스', '명지대역', '용인공용버스터미널', '기흥역', '동백역'];
  const endPoints = ['명지대 자연캠퍼스', '명지대역', '용인공용버스터미널', '기흥역', '동백역'];

  return (
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* 저장된 즐겨찾기 목록 섹션 */}
            <View style={styles.section}>
              <Text style={styles.subtitle}>저장된 즐겨찾기</Text>
              {favorites.length > 0 ? (
                  <View>
                    {favorites.map((item) => (
                        <View style={styles.savedItemContainer} key={item.id}>
                          <TouchableOpacity
                              style={styles.savedItem}
                              onPress={() => {
                                onSelect(item.startPoint, item.endPoint);
                                onClose();
                              }}
                          >
                            <Text style={styles.savedItemText}>
                              {item.startPoint} → {item.endPoint}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => onDeleteFavorite(item.id)}
                          >
                            <Text style={styles.deleteButtonText}>삭제</Text>
                          </TouchableOpacity>
                        </View>
                    ))}
                  </View>
              ) : (
                  <Text style={styles.noFavorites}>저장된 즐겨찾기가 없습니다.</Text>
              )}
            </View>

            {/* 새로운 즐겨찾기 추가 섹션 */}
            <View style={styles.section}>
              <Text style={styles.subtitle}>출발지 선택</Text>
              <TouchableOpacity
                  style={[styles.item, selectedStartPoint ? styles.selectedItem : {}]}
                  onPress={() => setShowStartPoints(!showStartPoints)}
              >
                <Text style={styles.itemText}>{selectedStartPoint || '출발지를 선택하세요'}</Text>
              </TouchableOpacity>

              {showStartPoints && (
                  <View>
                    {startPoints.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={styles.listItem}
                            onPress={() => {
                              setSelectedStartPoint(item);
                              setShowStartPoints(false);
                            }}
                        >
                          <Text style={styles.listItemText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                  </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.subtitle}>목적지 선택</Text>
              <TouchableOpacity
                  style={[styles.item, selectedEndPoint ? styles.selectedItem : {}]}
                  onPress={() => setShowEndPoints(!showEndPoints)}
              >
                <Text style={styles.itemText}>{selectedEndPoint || '목적지를 선택하세요'}</Text>
              </TouchableOpacity>

              {showEndPoints && (
                  <View>
                    {endPoints.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={styles.listItem}
                            onPress={() => {
                              setSelectedEndPoint(item);
                              setShowEndPoints(false);
                            }}
                        >
                          <Text style={styles.listItemText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                  </View>
              )}
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (selectedStartPoint && selectedEndPoint) {
                    onAddFavorite(selectedStartPoint, selectedEndPoint);
                    setSelectedStartPoint(null);
                    setSelectedEndPoint(null);
                  } else {
                    alert('출발지와 목적지를 선택해주세요.');
                  }
                }}
            >
              <Text style={styles.addButtonText}>즐겨찾기 추가</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'flex-start',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 5,
  },
  itemText: {
    fontSize: 16,
    color: '#555',
  },
  selectedItem: {
    backgroundColor: '#e0f7fa',
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: 'white',
  },
  savedItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  savedItem: {
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    flex: 1,
  },
  savedItemText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#ff6347',
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
  noFavorites: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#ff6f61',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
  },
});

export default FavoriteModal;
