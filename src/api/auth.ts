import axiosInstance from "./axios";
import {getEncryptStorage} from "../utils";
import {AxiosError} from "axios";
import Config from "react-native-config";

interface ApiError {
    message: string;
    statusCode?: number;
    error?: string;
}

// Request types
type RequestUser = {
    username: string;
    password: string;
};

type RequestSignUpUser = {
    email: string;
    password: string;
    username: string;
    phoneNumber: string;
    role: 'driver' | 'passenger';
    vehicleInfo?: {
        model: string;
        licensePlate: string;
        seatingCapacity: number;
    };
};

// Response types
type ResponseToken = {
    accessToken: string;
    refreshToken: string;
};

type ResponseProfile = {
    username: string;
    email: string;
    phoneNumber: string;
    role: 'driver' | 'passenger';
    profile: {
        profilePicture: string;
        bio: string;
    };
    vehicleInfo?: {
        model: string;
        licensePlate: string;
        seatingCapacity: number;
    };
};

// API functions
const postSignUp = async (signupData: RequestSignUpUser): Promise<void> => {
    console.log("API 함수로 전달받은 데이터:", JSON.stringify(signupData, null, 2));

    try {
        const response = await axiosInstance.post("/auth/signup", signupData);
        console.log("서버 응답:", response.data);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            const errorData = error.response?.data as ApiError;
            console.error("회원가입 요청 에러:", {
                requestData: signupData,
                error: errorData || error.message
            });
            throw new Error(errorData?.message || error.message || '회원가입에 실패했습니다.');
        }
        throw error;
    }
};

const postLogIn = async ({username, password}: RequestUser): Promise<ResponseToken> => {
    console.log("postLogin - Request:", {
        method: "POST",
        data: { username: username, password }
    });
    try {
        const { data } = await axiosInstance.post('/auth/signin', { username: username, password });
        console.log("login data: ", data);
        return data;
    } catch (error) {
        console.error("postLogin - Error:", error);
        throw new Error('Login request failed');
    }
};

const getProfile = async (): Promise<ResponseProfile> => {
    const {data} = await axiosInstance.get('/auth/me');
    return data;
};

const getAccessToken = async (): Promise<ResponseToken> => {
    const refreshToken = await getEncryptStorage('refreshToken');
    const {data} = await axiosInstance.get('/auth/refresh', {
        headers: {
            Authorization: `Bearer ${refreshToken}`,
        },
    });
    return data;
};

const logout = async () => {
    await axiosInstance.post('/auth/logout');
};

const sendVerificationCode = async (email: string): Promise<string> => {
    try {
        console.log('Sending verification code request:', email);
        console.log("API_URL: ", Config.API_URL);
        const response = await axiosInstance.post("/mail/send-code", {
            email: email.trim()  // 이메일을 서버에 전달
        });

        console.log('Verification code response:', response.data);
        return response.data;  // 반환된 인증 코드 반환
    } catch (error: any) {
        console.error('Verification code error:', {
            email,
            error: error.message,
            response: error.response?.data
        });
        throw new Error(
            error.response?.data?.message ||
            '인증 코드 전송에 실패했습니다.'
        );
    }
};

const verifyCode = async (email: string, code: string): Promise<boolean> => {
    try {
        console.log('Verifying code:', {email, code});

        const response = await axiosInstance.post('/mail/verify-code', {
            email: email.trim(),
            code: code.trim()  // 입력된 코드 전달
        });

        console.log('Code verification response:', response.data);
        return response.data;  // 인증 성공 여부 반환
    } catch (error: any) {
        console.error('Code verification error:', {
            email,
            code,
            error: error.message,
            response: error.response?.data
        });
        throw new Error(
            error.response?.data?.message ||
            '인증에 실패했습니다.'
        );
    }
};

const getDriverReviews = async (driverId: number): Promise<any> => {
    try {
        const { data } = await axiosInstance.get(`/reviews/driver/${driverId}`);
        console.log("Driver reviews data: ", data);
        return data;
    } catch (error) {
        console.error("Error fetching driver reviews:", error);
        throw new Error('Error fetching driver reviews');
    }
};

export {postSignUp, postLogIn, getProfile, getAccessToken, sendVerificationCode, verifyCode, logout, getDriverReviews}; // logout은 서버에서 구현 안할것 같음
export type {
    RequestUser,
    RequestSignUpUser,
    ResponseToken,
    ResponseProfile,
};
