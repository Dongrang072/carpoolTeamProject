import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    Alert,
    TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../hooks/queries/useAuth";
import { ResponseProfile } from "../../api/auth";

function MyMenuHomeScreen() {
    const navigation = useNavigation();
    const { getProfileQuery } = useAuth();

    // 프로필 정보를 서버에서 가져온 후 기본값으로 설정
    const initialProfileData: ResponseProfile = (getProfileQuery.data as ResponseProfile) || {
        role: "passenger",
        username: "",
        email: "",
        phoneNumber: "",
        profile: {
            profilePicture: "",
            bio: "",
        },
        vehicleInfo: {
            model: "",
            licensePlate: "",
            seatingCapacity: 0,
        },
    };

    const [state, setState] = useState<ResponseProfile>(initialProfileData);
    const [phoneNumber, setPhoneNumber] = useState(initialProfileData.phoneNumber);
    const [model, setModel] = useState(initialProfileData.vehicleInfo?.model || "");
    const [licensePlate, setLicensePlate] = useState(initialProfileData.vehicleInfo?.licensePlate || "");
    const [seatingCapacity, setSeatingCapacity] = useState(initialProfileData.vehicleInfo?.seatingCapacity || 0);
    const [seatingCapacityError, setSeatingCapacityError] = useState("");
    const [inputError, setInputError] = useState("");

    useEffect(() => {
        if (getProfileQuery.data) {
            const profileData: ResponseProfile = getProfileQuery.data as ResponseProfile;
            setState(profileData);
            setPhoneNumber(profileData.phoneNumber);
            setModel(profileData.vehicleInfo?.model || "");
            setLicensePlate(profileData.vehicleInfo?.licensePlate || "");
            setSeatingCapacity(profileData.vehicleInfo?.seatingCapacity || 0);
        }
    }, [getProfileQuery.data]);

    if (getProfileQuery.isLoading) {
        return <Text>Loading...</Text>;
    }

    if (getProfileQuery.isError) {
        return <Text>Error loading profile data.</Text>;
    }

    const handleGoBack = () => {
        if (!phoneNumber || (state.role === "driver" && (!model || !licensePlate || !seatingCapacity || parseInt(seatingCapacity.toString()) < 1 || parseInt(seatingCapacity.toString()) > 6))) {
            Alert.alert("알림", "모든 필드를 올바르게 입력해주세요.");
            return;
        }
        navigation.goBack();
    };

    const handleSaveChanges = () => {
        if (!phoneNumber || (state.role === "driver" && (!model || !licensePlate || !seatingCapacity))) {
            setInputError("모든 필드를 입력해주세요.");
            return;
        }

        if (state.role === "driver" && (parseInt(seatingCapacity.toString()) < 1 || parseInt(seatingCapacity.toString()) > 6)) {
            setSeatingCapacityError("좌석 수는 1에서 6 사이여야 합니다.");
            return;
        }

        Alert.alert("알림", "변경이 완료되었습니다.");
        setState({
            ...state,
            phoneNumber,
            vehicleInfo: {
                model,
                licensePlate,
                seatingCapacity,
            },
        });
        setInputError("");
    };

    const handleCancelChanges = () => {
        Alert.alert(
            "알림",
            "변경 내용을 취소하시겠습니까?",
            [
                {
                    text: "확인",
                    onPress: () => {
                        setPhoneNumber(state.phoneNumber);
                        setModel(state.vehicleInfo?.model || "");
                        setLicensePlate(state.vehicleInfo?.licensePlate || "");
                        setSeatingCapacity(state.vehicleInfo?.seatingCapacity || 0);
                        setSeatingCapacityError("");
                        setInputError("");
                    },
                },
                { text: "취소", style: "cancel" },
            ]
        );
    };

    const handleViewPointsHistory = () => {
        navigation.navigate("PointsHistory");
    };

    const handleViewUsageHistory = () => {
        navigation.navigate("UsageHistory");
    };

    const handleSeatingCapacityChange = (text: any) => {
        const value = text.replace(/[^0-9]/g, "");
        setSeatingCapacity(value);

        if (parseInt(value) < 1 || parseInt(value) > 6) {
            setSeatingCapacityError("좌석 수는 1에서 6 사이여야 합니다.");
        } else {
            setSeatingCapacityError("");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Pressable style={styles.backButton} onPress={handleGoBack}>
                <Icon name="arrow-back" size={24} color="#000" />
            </Pressable>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileHeader}>
                    <View style={styles.profileImageContainer}>
                        {state.profile?.profilePicture ? (
                            <Image
                                source={{ uri: state.profile.profilePicture }}
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <Image
                                source={require('../../asset/user-profile-default.png')}
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                        )}
                    </View>
                    <Text style={styles.profileName}>{state.username}</Text>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>Role: {state.role}</Text>
                    <Text style={styles.infoText}>Email: {state.email}</Text>
                </View>

                <View style={styles.editableInfoContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="휴대폰 번호 입력"
                        value={phoneNumber}
                        onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                        keyboardType="numeric"
                    />
                    {state.role === "driver" && (
                        <>
                            <TextInput
                                style={styles.input}
                                placeholder="차량 모델 입력"
                                value={model}
                                onChangeText={setModel}
                                editable={state.role === "driver"}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="차량 번호판 입력"
                                value={licensePlate}
                                onChangeText={setLicensePlate}
                                editable={state.role === "driver"}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="좌석 수 입력 (1-6)"
                                value={seatingCapacity.toString()}
                                onChangeText={handleSeatingCapacityChange}
                                keyboardType="numeric"
                                editable={state.role === "driver"}
                            />
                            {seatingCapacityError ? (
                                <Text style={styles.errorText}>{seatingCapacityError}</Text>
                            ) : null}
                        </>
                    )}
                    {inputError ? (
                        <Text style={styles.errorText}>{inputError}</Text>
                    ) : null}
                </View>

                <View style={styles.boxContainer}>
                    <Pressable style={styles.box} onPress={handleViewPointsHistory}>
                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../../asset/point-history-tema.png')}
                                style={styles.emptyImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>포인트 내역</Text>
                            <Text style={styles.subtitle}>포인트 내역 바로가기</Text>
                        </View>
                        <Icon name="chevron-forward" size={24} color="#000" />
                    </Pressable>

                    <Pressable style={styles.box} onPress={handleViewUsageHistory}>
                        <View style={styles.iconContainer}>
                            <Image
                                source={require('../../asset/user-history-tema.png')}
                                style={styles.emptyImage}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>이용 내역</Text>
                            <Text style={styles.subtitle}>이용 내역 바로가기</Text>
                        </View>
                        <Icon name="chevron-forward" size={24} color="#000" />
                    </Pressable>
                </View>

                <View style={styles.buttonContainer}>
                    <Pressable style={styles.saveButton} onPress={handleSaveChanges}>
                        <Text style={styles.buttonText}>변경</Text>
                    </Pressable>
                    <Pressable style={styles.cancelButton} onPress={handleCancelChanges}>
                        <Text style={styles.buttonText}>취소</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    backButton: {
        marginTop: 20,
        marginLeft: 15,
    },
    scrollContent: {
        padding: 20,
    },
    profileHeader: {
        alignItems: "center",
        marginBottom: 20,
    },
    profileImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    profileImage: {
        width: "100%",
        height: "100%",
        borderRadius: 40,
    },
    profileName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    infoContainer: {
        marginVertical: 10,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingVertical: 5,
    },
    editableInfoContainer: {
        marginVertical: 10,
    },
    input: {
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingVertical: 5,
        marginBottom: 10,
    },
    errorText: {
        color: "red",
        fontSize: 14,
        marginTop: -5,
        marginBottom: 10,
    },
    boxContainer: {
        marginTop: 20,
    },
    box: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 25,
        backgroundColor: "#E5E5E5",
        marginRight: 15,
    },
    icon: {
        width: 30,
        height: 30,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        flex: 1,
        marginRight: 10,
        alignItems: "center",
        borderRadius: 5,
    },
    cancelButton: {
        backgroundColor: "#007BFF",
        padding: 15,
        flex: 1,
        marginLeft: 10,
        alignItems: "center",
        borderRadius: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    emptyImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
    }
});

export default MyMenuHomeScreen;
