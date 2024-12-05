import React from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {Marker} from 'react-native-maps';
import {colors} from '../constants';

interface DriverMarkerProps {
  coordinate: {latitude: number; longitude: number};
  onPress?: () => void;
}

function DriverMarker({coordinate, onPress}: DriverMarkerProps) {
  return (
    <Marker coordinate={coordinate} onPress={onPress}>
      <View style={styles.container}>
        <Image
          source={require('../asset/free-icon-location-marker-5953713.png')} //마커 이미지를 저장한 경로
          style={styles.markerImage}
          resizeMode="contain"
        />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 70,
    alignItems: 'center'
  },
  markerImage: {
    width: 80,
    height: 40,
    alignItems: 'center',
  },
});

export default DriverMarker;
