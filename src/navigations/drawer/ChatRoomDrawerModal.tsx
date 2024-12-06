import React, {useEffect} from 'react';
import { View, Text, Modal,TouchableOpacity, StyleSheet, Animated, Dimensions, FlatList,Alert } from 'react-native';
import { colors} from '../../constants';
import {ChatUser} from '../../store/SocketStore';
import Icon from "react-native-vector-icons/Ionicons";


interface ChatDrawerModalProps {
    visible: boolean;
    onClose: () => void;
    users: ChatUser[];
    onLeaveRoom: (roomId: string) => void;
    roomId: string;
}

const ChatDrawerModal = ({
                             visible,
                             onClose,
                             users,
                             onLeaveRoom,
                             roomId,
                         }: ChatDrawerModalProps) => {
    const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').width))
        .current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: Dimensions.get('window').width,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleLeaveRoom = () => {
        Alert.alert('매칭 나가기', '정말 나가시겠습니까?', [
            {text: '취소', style: 'cancel'},
            {
                text: '나가기',
                style: 'destructive',
                onPress: () => {
                    onLeaveRoom(roomId);
                },
            },
        ]);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={[styles.sidePanel, {transform: [{translateX: slideAnim}]}]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>카풀 파티</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="menu" size={24} color={colors.BLACK} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={users}
                        renderItem={({item}) => (
                            <View style={styles.userItem}>
                                <Text style={styles.userName}>{item.name}</Text>
                                <Text style={styles.userRole}>
                                    {item.role === 'driver' ? '드라이버' : '탑승자'}
                                </Text>
                            </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />

                    <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveRoom}>
                        <Text style={styles.leaveButtonText}>매칭 나가기</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidePanel: {
        position: 'absolute',
        right: 0,
        width: '80%',
        height: '100%',
        backgroundColor: colors.WHITE,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    userItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.GRAY_200,
    },
    userName: {
        fontSize: 16,
    },
    userRole: {
        fontSize: 14,
        color: colors.GRAY_500,
    },
    leaveButton: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: colors.RED_500,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    leaveButtonText: {
        color: colors.WHITE,
        fontWeight: '600',
    },
});

export default ChatDrawerModal;
