import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, FlatList, Image, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const UsageHistoryScreen = () => {
  const navigation = useNavigation();
  const usageHistory: string | ArrayLike<any> | null | undefined = []; // 현재 이용 내역이 없으면 빈 배열로 설정

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>이용 내역</Text>
        </View>

        {usageHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              {/* 이미지 추가 */}
              <Image
                  source={require('../../asset/user-history.png')}
                  style={styles.emptyContainer} // emptyImage
                  resizeMode="contain"
              />
              <Text style={styles.emptyText}>이용 내역이 없습니다.</Text>
            </View>
        ) : (
            <FlatList
                data={usageHistory}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.historyItem}>
                      <Text>{item}</Text>
                    </View>
                )}
            />
        )}
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#000',
  },
  historyItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});

export default UsageHistoryScreen;
