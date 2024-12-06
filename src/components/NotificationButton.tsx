import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useNotificationManager } from '../managers/NotificationManager';  // 알림 상태 관리 훅

const NotificationButton = () => {
  const navigation = useNavigation();
  const { notifications } = useNotificationManager();  // 알림 데이터 받기

  const handlePress = () => {
    // 알림 화면으로 이동
    // @ts-ignore
    navigation.navigate('Notification', { notifications });  // 알림 화면에 알림 데이터를 전달
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <MaterialIcons name="notifications" color="white" size={30} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: -400,
    backgroundColor: '#FFB74D',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
  },
});

export default NotificationButton;
