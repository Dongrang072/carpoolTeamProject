import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {StyleSheet} from 'react-native';
import {mapNavigations} from '../../constants';
import mapHomeScreen from '../../screens/map/MapHomeScreen';
import ChatScreen from "../../screens/chat/ChatScreen";

export type MapStackParamList = {
    [mapNavigations.MAP_HOME]: { reset?: boolean };
    [mapNavigations.CHAT]: {
        roomId: string;
        token: string;
        isDriver: boolean;
    };
};
const Stack = createStackNavigator();

function MapStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: {
          backgroundColor: 'white',
        },
        headerStyle: {
          backgroundColor: 'white',
          shadowColor: 'grey',
        },
        headerTitleStyle: {
          fontSize: 15,
        },
        headerTintColor: 'black',
      }}>
      <Stack.Screen
        name={mapNavigations.MAP_HOME}
        component={mapHomeScreen}
        options={{
          headerTitle: '',
          headerShown: false,
        }}
      />
        <Stack.Screen
            name={mapNavigations.CHAT}
            component={ChatScreen}
            options={{
                headerTitle: '채팅',
                headerShown: true,
            }}
        />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});
export default MapStackNavigator;
