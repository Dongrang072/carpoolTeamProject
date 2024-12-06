import React, {useEffect, useRef, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import MapView, {LatLng, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {colors, mapNavigations} from '../../constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import stationlocations from '../../constants/stationlocations';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {MapStackParamList} from '../../navigations/stack/MapStackNavigator';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {MainDrawerParamList} from '../../navigations/drawer/MainDrawerNavigator';
import useUserLocation from '../../hooks/useUserLocation';
import usePermission from '../../hooks/usePermission';
import mapStyle from '../../style/mapStyle';
import CustomMarker from '../../components/CustomMarkers';
import stationLocations from '../../constants/stationlocations';
import BottomDrawer from '../../components/BottomDrawer';
import MarkerModal from '../../components/MarkerModal';
import {useMatchingStatus, useMatching} from '../../hooks/queries/useMatching';
import FavoriteButton from '../../components/FavoriteButton'; // 즐겨찾기 버튼
import FavoriteModal from '../../components/FavoriteModal'; // 즐겨찾기 모달
import NotificationButton from '../../components/NotificationButton';
import useAuth from '../../hooks/queries/useAuth';
import {getEncryptStorage} from '../../utils';
import DriverMarker from '../../components/DriverMarker';
import useDriverLocationStore from '../../store/DriverLocation';
import {completeRide} from '../../api/matching';
import ReviewModal from "../../components/modal/ReviewModal";
import PointReceivedModal from "../../components/modal/PointReceivedModal";
import {pricingData} from "../../components/PricingHelpModal";
import StationLocations from "../../constants/stationlocations";

type Navigation = CompositeNavigationProp<
  StackNavigationProp<MapStackParamList>,
  DrawerNavigationProp<MainDrawerParamList>
>;

function MapHomeScreen({route}: {route: any}) {
  const inset = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const mapRef = useRef<MapView | null>(null);
  const {userLocation, isUserLocationError} = useUserLocation();
  const [startPoint, setStartPoint] = useState<number | null>(null);
  const [endPoint, setEndPoint] = useState<number | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false); // 바텀 드로워 표시 상태
  const [isMatching, setIsMatching] = useState(false);
  const [isRiding, setIsRiding] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [receivedPoints, setReceivedPoints] = useState(0); // 받은 포인트 저장

  const {
    requestMatchingMutation,
    cancelMatchingMutation,
    agreeToStartRideMutation,
    completeRideMutation,
  } = useMatching();

  const [matchingKey, setMatchingKey] = useState<string | null>(null);
  const [rideRequestId, setRideRequestId] = useState<number | null>(null);
  const {role} = useAuth();
  const {location: driverLocation, setLocation: setDriverLocation} =
    useDriverLocationStore();
  // @ts-ignore
  const {data: matchingStatus} = useMatchingStatus(matchingKey ?? '', {
    enabled: !!matchingKey,
  });

  // 즐겨찾기 기능
  const [isFavoriteModalVisible, setFavoriteModalVisible] = useState(false);
  const [favorites, setFavorites] = useState<
    {id: string; startPoint: string; endPoint: string}[]
  >([]);
  const handleAddFavorite = (startPoint: string, endPoint: string) => {
    setFavorites(prev => [
      ...prev,
      {id: Date.now().toString(), startPoint, endPoint},
    ]);
    Alert.alert(
      '즐겨찾기 추가 완료',
      `출발지: ${startPoint}, 목적지: ${endPoint}`,
    );
  };

  // 즐겨찾기 삭제 함수
  const handleDeleteFavorite = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  // 즐겨찾기 선택 함수
  const handleFavoriteSelect = (startPoint: string, endPoint: string) => {
    // 출발지와 목적지를 설정
    const start = stationlocations.find(
      station => station.stationName === startPoint,
    )?.id; // id로 설정 (number)
    const end = stationlocations.find(
      station => station.stationName === endPoint,
    )?.id; // id로 설정 (number)

    if (start !== undefined && end !== undefined) {
      setStartPoint(start);
      setEndPoint(end);

      // 해당 출발지와 목적지의 좌표로 지도 이동
      const startCoordinate = stationlocations[start]?.coordinate;
      const endCoordinate = stationlocations[end]?.coordinate;

      if (startCoordinate && endCoordinate) {
        moveMapView(startCoordinate);
        setTimeout(() => moveMapView(endCoordinate), 500); // 목적지 좌표로 잠시 후 이동
      } else {
        Alert.alert('오류', '좌표를 찾을 수 없습니다.');
      }
    }
  };
  // 알람 클릭
  const handleNotificationPress = () => {
    navigation.navigate('Notification'); // Notification 화면으로 이동
  };

  usePermission('LOCATION');

  const moveMapView = (coordinate: LatLng) => {
    mapRef.current?.animateToRegion({
      ...coordinate,
      longitudeDelta: 0.0922,
      latitudeDelta: 0.0421,
    });
  };

  const handlePressUserLocation = () => {
    if (isUserLocationError) {
      console.warn('User location error');
      return;
    }
    moveMapView(userLocation);
  };

  const handleMarkerPress = (
    coordinate: {latitude: number; longitude: number},
    id: number,
  ) => {
    console.log('Marker pressed:', id, coordinate);
    setSelectedMarker(id);
    setIsModalVisible(true);
  };

  const handleSetStart = () => {
    console.log('Setting startPoint:', selectedMarker);
    setStartPoint(selectedMarker);
    Alert.alert(
      '출발지 설정',
      `${
        stationLocations[selectedMarker!].stationName
      }이(가) 출발지로 설정되었습니다.`,
    );
    setIsModalVisible(false);
  };

  const handleSetEnd = () => {
    console.log('Setting endPoint:', selectedMarker);
    setEndPoint(selectedMarker);
    Alert.alert(
      '도착지 설정',
      `${
        stationLocations[selectedMarker!].stationName
      }이(가) 도착지로 설정되었습니다.`,
    );
    setIsModalVisible(false);
  };
  // 즐겨찾기 버튼 핸들러
  const handleFavoriteButtonPress = () => {
    setFavoriteModalVisible(true);
  };

  const calculatePoints = (startStation: number | null, endStation: number | null): number => {
    if (startPoint === null || endPoint === null) return 0;

    const startName = StationLocations.find(
        station => station.id === startPoint
    )?.stationName;

    const endName = StationLocations.find(
        station => station.id === endPoint
    )?.stationName;

    if (!startName || !endName) {
      console.warn(`Cannot find station names for IDs: ${startPoint}, ${endPoint}`);
      return 0;
    }
    const route = pricingData.find(
        route =>
            (route.departure === startName && route.destination === endName) ||
            (route.departure === endName && route.destination === startName)
    );

    if (!route) {
      console.warn(`No pricing found for route: ${startName} -> ${endName}`);
      return 0;
    }
    // 기본 요금을 포인트로 사용 (price[0]이 기본 요금)
    // 포인트는 요금의 일정 비율로 계산 (예: 10%)
    const pointRate = 0.1;
    return Math.floor(route.price[0] * pointRate);
  };

  useEffect(() => {
    if (matchingStatus?.status) {
      const {status, rideRequestId: newRideRequestId} = matchingStatus.status;

      // 매칭 상태에 따른 UI 업데이트
      setIsMatching(status === 0 || status === 1);

      if (status === 1 && newRideRequestId !== -1) {
        setRideRequestId(newRideRequestId);
        Alert.alert(
          '매칭 완료',
          '매칭이 성공적으로 완료되었습니다. 채팅방으로 이동합니다.',
          [
            {
              text: '확인',
              onPress: () => navigateToChat(newRideRequestId),
            },
          ],
        );
      }
      if (status === 2) {
        if (role === 'passenger') {
          // 탑승자: 리뷰 모달 표시
          setIsReviewModalVisible(true);
          setIsRiding(false);
          handleReset();
        } else if (role === 'driver') {
          // 운전자: 포인트 모달 표시 (포인트는 API 응답에서 받아와야 함)
          const calculatedPoints = calculatePoints(startPoint, endPoint);
          setReceivedPoints(calculatedPoints);
          setIsPointModalVisible(true);
          setIsRiding(false);
          handleReset();
        }
      }
    }
  }, [matchingStatus]);

  const handleReviewSubmitted = async () => {
    setIsReviewModalVisible(false);
    resetMatchingState();
    Alert.alert('리뷰 작성 완료', '리뷰가 성공적으로 제출되었습니다.');
  };

  const handlePointModalClose = () => {
    setIsPointModalVisible(false);
    resetMatchingState();
  };


  const handleCloseDrawer = () => {
    setIsDrawerVisible(false); // 드로워 닫기
  };

  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setIsDrawerVisible(false);
    setIsMatching(false); // 매칭 상태 초기화
    setDriverLocation(null); //driver marker 초기화
    Alert.alert('초기화 완료', '출발지와 도착지가 초기화되었습니다.');
  };

  const handleMatchRequest = async () => {
    console.log('start point in handleMatchRequest: ', startPoint);
    console.log('end point in handleMatchRequest: ', endPoint);
    if (
      startPoint === null ||
      startPoint === undefined ||
      endPoint === null ||
      endPoint === undefined
    ) {
      Alert.alert('오류', '출발지와 도착지를 모두 설정해주세요.');
      return;
    }

    if (isMatching) {
      Alert.alert('오류', '이미 매칭 요청이 진행 중입니다.');
      return;
    }

    try {
      const key = `${startPoint}-${endPoint}`;
      setMatchingKey(key);
      setIsMatching(true);
      setIsDrawerVisible(false);

      await requestMatchingMutation.mutateAsync({
        startPoint,
        endPoint,
        requestTime: new Date().toISOString(),
      });

      Alert.alert('매칭 요청', '매칭이 요청되었습니다.');
    } catch (error) {
      setMatchingKey(null);
      setIsMatching(false);
      Alert.alert(
        '오류',
        error instanceof Error
          ? error.message
          : '매칭 요청 중 문제가 발생했습니다.',
      );
    }
  };

  const handleCancel = async () => {
    if (!matchingKey) return;

    try {
      console.log('cancel point in handleMatchRequest: ', matchingKey);
      await cancelMatchingMutation.mutateAsync(matchingKey);
      resetMatchingState();
      Alert.alert('매칭 취소', '매칭이 취소되었습니다.');
    } catch (error) {
      Alert.alert(
        '오류',
        error instanceof Error
          ? error.message
          : '매칭 취소 중 문제가 발생했습니다.',
      );
    }
  };

  useEffect(() => {
    if (route.params?.reset) {
      resetMatchingState();
    }
  }, [route.params]);

  const navigateToChat = async (rideRequestId: number) => {
    try {
      const token = await getEncryptStorage('accessToken');

      navigation.navigate(mapNavigations.CHAT, {
        roomId: rideRequestId.toString(),
        token,
        isDriver: role === 'driver',
      });
    } catch (error) {
      console.log('채팅방 입장 오류: ', error);
      Alert.alert('오류', '채팅방 입장에 실패했습니다.');
    }
  };

  const resetMatchingState = () => {
    setStartPoint(null);
    setEndPoint(null);
    setIsDrawerVisible(false);
    setIsMatching(false);
    setMatchingKey(null);
    setRideRequestId(null);
    setIsRiding(false);
    setIsReviewModalVisible(false); // 리뷰 모달 닫기
    setIsPointModalVisible(false); // 포인트 모달 닫기
  };

  const getSelectedCoordinates = () => {
    if (startPoint !== null && endPoint !== null) {
      const start = stationLocations[startPoint].coordinate;
      const end = stationLocations[endPoint].coordinate;

      if (!start || !end) {
        // 시작점이나 끝점이 잘못되었을 경우 처리
        console.warn('Invalid startPoint or endPoint');
        Alert.alert(
          '오류',
          '선택한 출발지나 목적지가 유효하지 않습니다. 다시 선택해주세요.',
        );
        return [];
      }

      return [start, end];
    }
    return [];
  };

  const handleSelectStation = (type: 'start' | 'end') => {
    // 스테이션 선택을 처리하는 로직
    console.log(`Station selection initiated for ${type}`);
  };

  const handleAgreeToStartRide = async () => {
    try {
      await agreeToStartRideMutation.mutateAsync(rideRequestId!);
      setIsRiding(true);
      if(role === 'driver'){
        Alert.alert('운행 시작', '운행이 시작되었습니다.');
      } else if(role === 'passenger'){
        Alert.alert('탑승 완료', '운전자의 차량에 탑승했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '운행 시작 중 문제가 발생했습니다.');
    }
  };
  if (role === 'passenger') {
    console.log(
      `driverLocation?.latitude: ${driverLocation?.latitude} driverLocation.longitude: ${driverLocation?.longitude}`,
    );
  } else {
    console.log('my driver location: ', userLocation);
  }

  const handleCompleteRide = async () => {
    try {
      await completeRideMutation.mutateAsync(rideRequestId!);
      if (role === 'driver') {
        // 운전자의 경우 서버에서 완료 처리만 하고
        // matchingStatus 변경을 기다림 (위 useEffect에서 처리)
        Alert.alert('운행 완료', '운행이 완료되었습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '운행 완료 중 문제가 발생했습니다.');
    }
  };

  return (
    <>
      <MapView
        ref={mapRef}
        style={styles.container}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={false}
        customMapStyle={mapStyle}>
        {stationlocations.map(location => (
          <CustomMarker
            key={location.id}
            coordinate={location.coordinate}
            name={location.stationName} // name prop 추가
            color={
              startPoint === location.id
                ? 'RED'
                : endPoint === location.id
                ? 'YELLOW'
                : 'BLUE'
            }
            onPress={() => handleMarkerPress(location.coordinate, location.id)}
          />
        ))}
        {startPoint !== null && endPoint !== null && (
          <Polyline
            coordinates={getSelectedCoordinates()}
            strokeColor={colors.BLUE_500} // 선 색상
            strokeWidth={3} // 선 두께
          />
        )}
        {role === 'passenger' &&
          driverLocation?.latitude &&
          driverLocation?.longitude && (
            <DriverMarker
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
            />
          )}
      </MapView>
      <Pressable
        style={[styles.drawerButton, {top: inset.top || 20}]}
        onPress={() => navigation.openDrawer()}>
        <Ionicons name="menu" color={colors.WHITE} size={25} />
      </Pressable>
      <View style={styles.buttonList}>
        <Pressable style={styles.mapButton} onPress={handlePressUserLocation}>
          <MaterialIcons name="my-location" color={colors.WHITE} size={25} />
        </Pressable>
        <Pressable
          style={[styles.resetButton, (isMatching || isRiding) && styles.disabledButton]}
          onPress={handleReset}
          disabled={isMatching || isRiding} // 매칭 중일 때 비활성화
        >
          <MaterialIcons name="refresh" color={colors.WHITE} size={25} />
        </Pressable>
        <FavoriteButton onPress={() => setFavoriteModalVisible(true)} />
      </View>
      {startPoint !== null && endPoint !== null && (
        <Pressable
          style={[
            styles.matchingStartButton,
            isMatching && styles.matchingInProgressButton,
          ]}
          onPress={() => setIsDrawerVisible(true)}>
          <Text style={styles.matchingStartText}>
            {isRiding ? '운행중입니다' : isMatching ? '매칭 중입니다' : '매칭 시작하기'}
          </Text>
          <MaterialIcons
            name={isMatching ? 'hourglass-empty' : 'send'}
            color={colors.WHITE}
            size={25}
          />
        </Pressable>
      )}
      <MarkerModal
        visible={isModalVisible}
        name={
          selectedMarker !== null && stationLocations[selectedMarker]
            ? stationLocations[selectedMarker].stationName
            : 'Unknown'
        }
        address={
          selectedMarker !== null && stationLocations[selectedMarker]
            ? stationLocations[selectedMarker].address
            : '주소 정보 없음'
        }
        onClose={() => setIsModalVisible(false)}
        onSetStart={handleSetStart}
        onSetEnd={handleSetEnd}
      />

      <BottomDrawer
        isVisible={isDrawerVisible}
        startPoint={startPoint}
        endPoint={endPoint}
        stations={stationLocations}
        onSelectStation={handleSelectStation}
        onCancel={isMatching ? handleCancel : () => setIsDrawerVisible(false)}
        closeDrawer={() => handleCloseDrawer()}
        onMatchStart={handleMatchRequest}
        isMatching={isMatching}
        isMatched={
          rideRequestId != null && matchingStatus?.status?.status === 1
        }
        isRiding={isRiding}
        onNavigateToChat={() => navigateToChat(rideRequestId!)}
        onAgreeMatch={() => handleAgreeToStartRide()}
        role={role}
        onCompleteMatch={() => handleCompleteRide()}
      />
      <FavoriteModal
        visible={isFavoriteModalVisible}
        onClose={() => setFavoriteModalVisible(false)}
        onSelect={handleFavoriteSelect}
        onAddFavorite={handleAddFavorite}
        favorites={favorites}
        onDeleteFavorite={handleDeleteFavorite} // 삭제 함수 전달
      />
      <ReviewModal
          visible={isReviewModalVisible}
          onClose={() => setIsReviewModalVisible(false)}
          matchId={rideRequestId!}
          onReviewSubmitted={handleReviewSubmitted}
      />
      <PointReceivedModal
          visible={isPointModalVisible}
          onClose={handlePointModalClose}
          points={receivedPoints}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.BLUE_500,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 1, height: 1},
    elevation: 5,
  },
  buttonList: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  mapButton: {
    backgroundColor: colors.BLUE_500,
    marginVertical: 5,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    elevation: 2,
  },
  matchingStartButton: {
    position: 'absolute',
    bottom: 30,
    width: '50%',
    alignSelf: 'center',
    backgroundColor: colors.BLUE_500,
    paddingVertical: 12, // 상하 패딩 줄임
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: colors.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  matchingStartText: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: colors.RED_500,
    marginVertical: 5,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    elevation: 2,
  },
  matchingInProgressButton: {
    backgroundColor: colors.BLUE_ACTIVE, // 매칭 중일 때는 회색으로 변경
  },
  disabledButton: {
    backgroundColor: colors.GRAY_300, // 비활성화된 버튼 색상
  },
});

export default MapHomeScreen;
