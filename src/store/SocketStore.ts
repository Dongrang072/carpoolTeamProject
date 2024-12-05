// store/SocketStore.ts
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import Config from 'react-native-config';
import axiosInstance from '../api/axios';
import { AxiosHeaders } from 'axios';
import {Alert} from "react-native";
import useDriverLocationStore from "./DriverLocation";

export interface ChatUser {
    name: string;
    role: 'driver' | 'passenger';
}

export interface ChatMessage {
    id: string;
    name: string;
    message: string;
    coordinate?: {
        latitude: number;
        longitude: number;
    };
}

interface ServerEvents {
    message: {
        userName: string;
        message: string;
        coordinate?: {
            latitude: number;
            longitude: number;
        };
    };
    leaveRoom: {
        room: string;
        message: string;
    };
    userList: {
        room: string;
        users: ChatUser[];
    };
    messageLog: {
        room: string;
        logs: ChatMessage[];
    };
    error: {
        message: string;
    };
}

interface ClientEvents {
    send: {
        room: string;
        message: string;
        coordinate?: {
            latitude: number;
            longitude: number;
        };
    };
    leave: string;
    getUserList: string;
    getMessageLog: string;
}

interface SocketStore {
    socket: Socket | null;
    messages: ChatMessage[];
    chatLogs: { [roomId: string]: ChatMessage[] };
    users: ChatUser[];
    isConnected: boolean;
    error: string | null;

    connect: (roomId: string) => void;
    disconnect: () => void;
    sendMessage: (data: ClientEvents['send']) => void;
    leaveRoom: (roomId: string) => void;

    setMessages: (messages: ChatMessage[]) => void;
    setUsers: (users: ChatUser[]) => void;
    clearError: () => void;

    saveChatLog: (roomId: string, messages: ChatMessage[]) => void;
    getChatLog: (roomId: string) => ChatMessage[];
}

const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    messages: [],
    users: [],
    isConnected: false,
    error: null,
    chatLogs: {},


    connect: (roomId) => {
        roomId = `ride_request_${roomId}`;
        try {
            const authHeader = axiosInstance.defaults.headers.common['Authorization'];

            let token: RegExpExecArray | string = ''; // 기본값 설정

            // authHeader가 string인 경우
            if (typeof authHeader === 'string') {
                token = authHeader;
            }
            else if (Array.isArray(authHeader) && typeof authHeader[0] === 'string') {
                token = authHeader[0];
            }

            if (!token) {
                throw new Error('No authorization token found');
            }
            console.log("websocket Token: ", token);
            // 웹소켓 연결 시 동일한 Authorization 헤더 사용
            const socket = io(`${Config.WEBSOCKET_URL}/chatroom`, {
                extraHeaders: {
                    Authorization: token
                },
            });


            socket.on('connect', () => {
                set({ isConnected: true });
                socket.emit('getMessageLog', roomId);
                socket.emit('getUserList', roomId);
                console.log('Connected to chatroom');
            });

            socket.on('message', (data: ServerEvents['message']) => {
                if (data.coordinate) {
                    // 운전자 위치 저장
                    useDriverLocationStore.getState().setLocation(data.coordinate);
                }
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: Date.now().toString(),
                            name: data.userName,
                            message: data.message,
                            coordinate: data.coordinate
                        },
                    ],
                }));
            });
            //
            //User list for room [ride_request_20]: [
            //   { name: 'test1', role: 'driver' },
            //   { name: 'test2', role: 'passenger' }
            // ]
            socket.on('messageLog', (data: ServerEvents['messageLog']) => {
                set({ messages: data.logs });
                console.log("message log: ", data.logs);
            });
            // const logs: {   name: string   message: string }[]
            //
            // { (ride_request_20) user_Id [10] } :  {
            //     userName: 'test1',
            //         message: 'hihi from driver',
            //         coordinate: { latitude: 37.22269, longitude: 127.19016666666667 }
            // }
            //{ (ride_request_20) user_Id [11] } :  { userName: 'test2', message: 'ttttttt' }
            socket.on('userList', (data: ServerEvents['userList']) => {
                set({ users: data.users });
            });

            socket.on('leaveRoom', (data: ServerEvents['leaveRoom']) => {
                set((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            id: Date.now().toString(),
                            name: 'System',
                            message: data.message,
                        },
                    ],
                }));
            });

            socket.on('error', (data: ServerEvents['error']) => {
                set({ error: data.message });
                console.error('Socket error:', data.message);
            });

            socket.on('disconnect', () => {
                set({ isConnected: false });
            });

            set({ socket });
        } catch (error) {
            // error 객체의 타입 처리
            const errorMessage = error instanceof Error
                ? error.message
                : 'An unknown error occurred';
            set({ error: errorMessage });
        }
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({
                socket: null,
                messages: [],
                users: [],
                isConnected: false,
                error: null
            });
        }
    },

    sendMessage: (data) => {
        const { socket } = get();
        if (socket && socket.connected) {
            socket.emit('send', data);
        }
    },

    leaveRoom: (roomId) => {
        const { socket } = get();
        if (socket && socket.connected) {
            socket.emit('leave', roomId);
        }
    },

    setMessages: (messages) => set({ messages }),
    setUsers: (users) => set({ users }),
    clearError: () => set({ error: null }),

    saveChatLog: (roomId, messages) =>
        set(state => ({
            chatLogs: {
                ...state.chatLogs,
                [roomId]: messages
            }
        })),

    getChatLog: (roomId) => get().chatLogs[roomId] || [],

}));

export default useSocketStore;
