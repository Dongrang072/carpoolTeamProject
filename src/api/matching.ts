import axiosInstance from "./axios";
import {MatchingStatus} from "../constants/matchingStatus";

interface MatchingRequest {
    startPoint: number;
    endPoint: number;
    requestTime: string;
}

interface MatchingResponse {
    message: string;
}

interface MatchingStatusResponse {
    status: {
        status: MatchingStatus;
        rideRequestId: number; // -1일 경우 아직 그룹화가 안된거임
    };
}

const requestMatching = async (data: MatchingRequest): Promise<MatchingResponse> => {
    console.log("requestMatching request data: ", JSON.stringify(data, null, 2));
    const response = await axiosInstance.post('/matching/request', data);
    return response.data;
};

const cancelMatching = async (key: string): Promise<MatchingResponse> => {
    const response = await axiosInstance.post('/matching/cancel', { key });
    return response.data;
};

const getMatchingStatus = async (key: string): Promise<MatchingStatusResponse> => {
    const response = await axiosInstance.post('/matching/status', { key });
    return response.data;
};

const leaveMatch = async (rideRequestId: number): Promise<MatchingResponse> => {
    const response = await axiosInstance.post('/matching/leave', { rideRequestId });
    return response.data;
};

const agreeToStartRide = async (rideRequestId: number): Promise<MatchingResponse> => {
    const response = await axiosInstance.post('/matching/agree', { rideRequestId });
    return response.data;
};

const completeRide = async (rideRequestId: number): Promise<MatchingResponse> => {
    const response = await axiosInstance.post('/matching/complete', { rideRequestId });
    return response.data;
};

export {
    requestMatching,
    cancelMatching,
    getMatchingStatus,
    leaveMatch,
    agreeToStartRide,
    completeRide
}

export type {
    MatchingStatus,
    MatchingRequest,
    MatchingResponse,
}
