import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import useSocketStore from '../../store/SocketStore';
import useDriverLocationStore from '../../store/DriverLocation';
import useUserLocation from '../../hooks/useUserLocation';
import {colors, mapNavigations} from '../../constants';
import useAuth from '../../hooks/queries/useAuth';
import {MapStackParamList} from "../../navigations/stack/MapStackNavigator";
import {StackScreenProps} from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";
import ChatDrawerModal from "../../navigations/drawer/ChatRoomDrawerModal";
import {useMatching} from "../../hooks/queries/useMatching"; // 사용자 위치 훅

type ChatScreenProps = StackScreenProps<MapStackParamList, 'CHAT'>;

const ChatScreen = ({navigation, route}: ChatScreenProps) => {
  const {roomId, isDriver} = route.params;
  const {connect, disconnect, socket, getChatLog, saveChatLog} = useSocketStore();
  const {location, setLocation} = useDriverLocationStore();
  const {userLocation, isUserLocationError} = useUserLocation();
  const {myName, role} = useAuth();
  const [text, setText] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const {users} = useSocketStore();
  const {leaveMatchMutation} = useMatching();

  const showAlert = (title: string, message: string, onPress: () => void) => {
    Alert.alert(title, message, [{ text: '확인', onPress }]);
  };

  useEffect(() => {
    connect(roomId);
    return () => {
      disconnect();
    };
  }, [roomId, connect, disconnect]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
          <TouchableOpacity
              style={{marginRight: 16}}
              onPress={() => setIsUserListVisible(true)}>
            <Icon name="menu" size={24} color={colors.BLACK} />
          </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const savedMessages = getChatLog(roomId);
    if (savedMessages.length > 0) {
      setChatMessages(savedMessages);
    }
  }, [roomId]);

  // 메시지 업데이트될 때마다 저장
  useEffect(() => {
    saveChatLog(roomId, chatMessages);
  }, [chatMessages, roomId]);

  useEffect(() => {
    if (socket) {
      socket.on('message', data => {
        console.log('📩 Received message data:', data);
        console.log('🔍 Current user:', myName);
        console.log('✅ Is message from me?:', data.userName === myName);

        if (data.coordinate && !isDriver) {
          console.log('Driver location received:', data.coordinate);
          setLocation(data.coordinate); // 운전자 좌표 상태 업데이트
        }
        // 받은 메시지를 채팅 목록에 추가
        if (data.userName !== myName) {
          console.log('➕ Adding message to chat:', {
            messageContent: data.message,
            fromUser: data.userName,
          });
          setChatMessages((prevMessages) => {
            console.log('Previous messages:', prevMessages);
            const newMessages = [
              {
                id: Date.now().toString(),
                text: data.message,
                user: data.userName,
                createdAt: new Date(),
              },
              ...prevMessages,
            ];
            console.log('Updated messages:', newMessages);
            return newMessages;
          });
        }
      });

      socket.on('driverLeft', data => {
        showAlert('알림', data.message, () => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate(mapNavigations.MAP_HOME);
          }
        });
        const rideRequestId = parseInt(roomId, 10);
        leaveMatchMutation.mutateAsync(rideRequestId);
      });

      socket.on('leaveRoom', data => {
        showAlert('알림', data.message, () => {
          if (data.userName === myName) {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate(mapNavigations.MAP_HOME);
            }
          }
        });
      });

      socket.on('userList', ({users: updatedUsers}) => {
        console.log('[USER LIST] Updated:', updatedUsers);
        // Zustand store의 users 상태 업데이트
        useSocketStore.setState({ users: updatedUsers });
      });
    }

    return () => {
      socket?.off('message');
      socket?.off('driverLeft');
      socket?.off('leaveRoom');
      socket?.off('userList');
    };
  }, [socket, setLocation, myName, navigation]);

  const sendMessage = () => {
    const formedRoomId = `ride_request_${roomId}`;
    if (text.trim() && socket) {
      console.log('📤 Sending message:', {
        text: text.trim(),
        user: myName,
        room: formedRoomId,
      });

      const messagePayload: any = {
        room: formedRoomId,
        message: text.trim(),
        userName: myName,
      };

      // 운전자인 경우 좌표 추가
      if (isDriver && !isUserLocationError && userLocation) {
        messagePayload.coordinate = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        };
      }

      // 서버에 메시지 전송
      socket.emit('send', messagePayload);
      console.log('💬 Adding local message');
      // 메시지를 로컬 리스트에 추가
      setChatMessages(prevMessages => {
        console.log('Previous messages:', prevMessages);
        const newMessages = [
          {
            id: Date.now().toString(),
            text,
            userName: myName,
            role: role,
            createdAt: new Date(),
          },
          ...prevMessages,
        ];
        console.log('Updated messages:', newMessages);
        return newMessages;
      });

      setText('');
    }
  };

  const renderMessage = ({item}: {item: any}) => {
    const isMyMessage = item.userName === myName; // 본인 메시지 여부 확인
    console.log(`[${isDriver ? 'DRIVER' : 'PASSENGER'}] 🎯 Rendering message:`, {
      messageText: item.text,
      from: item.user,
      isMyMessage,
      currentUser: myName,
    });
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage, // 본인 메시지는 파란색, 나머지는 흰색
        ]}>
        <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
          {item.text}
        </Text>
        <Text style={isMyMessage ? styles.myMessageTime : styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  const handleLeaveRoom = (roomId: string) => {
    try {
      const rideRequestId = parseInt(roomId, 10);
      leaveMatchMutation.mutateAsync(rideRequestId);
      socket?.emit('leave', `ride_request_${roomId}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '매칭 나가기에 실패했습니다.');
    }
  };

  // const handleLeaveMatch = async (rideRequestId: number) => {
  //   try {
  //     await leaveMatchMutation.mutateAsync(rideRequestId);
  //     resetMatchingState();
  //   } catch (error) {
  //     Alert.alert('오류', '매칭 나가기에 실패했습니다.');
  //   }
  // };
  // map screen의 handleLeaveMatch랑 여기랑 연결, 추가해야 할 것 다른 스크린을 갔다 돌아와도 채팅 로그 유지(상태 저장), 맵에 드라이버 마커 표시

  return (
    <View style={styles.container}>
      <FlatList
        data={chatMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted // 최신 메시지를 위에 표시
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="메시지를 입력하세요"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
      <ChatDrawerModal
          visible={isUserListVisible}
          onClose={() => setIsUserListVisible(false)}
          users={users}
          onLeaveRoom={handleLeaveRoom}
          roomId={roomId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.BLUE_500,
  },
  myMessageText: {
    color: colors.WHITE, // 본인 메시지의 텍스트는 흰색
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff', // 다른 사람 메시지는 흰색
  },
  messageText: {
    color: colors.BLACK,
  },
  messageTime: {
    fontSize: 10,
    color: colors.GRAY_500,
    marginTop: 5,
  },
  myMessageTime: {
    fontSize: 10,
    color: colors.WHITE,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
