import {createDrawerNavigator} from '@react-navigation/drawer';
import MyMenuHomeScreen from '../../screens/profile/MyMenuHomeScreen';
import MapStackNavigator, {MapStackParamList} from '../stack/MapStackNavigator';
import {colors, mainNavigations} from '../../constants';
import {NavigatorScreenParams, RouteProp} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Dimensions} from 'react-native';
import CustomDrawerContent from './CustomDrawerContent';
import FeedHomeScreen from '../../screens/feed/FeedHomeScreen';
import NotificationScreen from '../../screens/NotificationScreen';
import MyMenuNavigator from "../stack/MyMenuNavigator";

export type MainDrawerParamList = {
  [mainNavigations.HOME]: NavigatorScreenParams<MapStackParamList>;
  [mainNavigations.FEED]: undefined;
  [mainNavigations.PROFILE]: undefined;
  [mainNavigations.NOTIFICATION]: undefined; // 알람 화면 타입 추가
};

const Drawer = createDrawerNavigator();

function DrawerIcons(route: RouteProp<MainDrawerParamList>, focused: boolean) {
  let iconName = '';
  switch (route.name) {
    case mainNavigations.HOME: {
      iconName = 'location-on';
      break;
    }
    case mainNavigations.FEED: {
      iconName = 'location-off';
      break;
    }
    case mainNavigations.PROFILE: {
      iconName = 'person';
      break;
    }
    case mainNavigations.NOTIFICATION: {
      // 알람 아이콘 처리
      iconName = 'notifications';
      break;
    }
  }
  return (
    <MaterialIcons
      name={iconName}
      size={18}
      color={focused ? colors.BLACK : colors.GRAY_500}
    />
  );
}

function MainDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props: any) => <CustomDrawerContent {...props} />}
      screenOptions={({route}: any) => ({
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: Dimensions.get('screen').width * 0.5,
          backgroundColor: colors.WHITE,
        },
        drawerActiveTintColor: colors.BLACK,
        drawerInactiveTintColor: colors.GRAY_500,
        drawerActiveBackgroundColor: colors.BLUE_300,
        drawerInactiveBackgroundColor: colors.GRAY_200,
        drawerLabelStyle: {
          fontWeight: '600',
        },
        drawerIcon: ({focused}: {focused: boolean}) =>
          DrawerIcons(route, focused),
      })}>
      <Drawer.Screen
        name={mainNavigations.HOME}
        component={MapStackNavigator}
        options={{
          title: '카풀 매칭',
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name={mainNavigations.FEED}
        component={FeedHomeScreen}
        options={{
          title: '피드',
        }}
      />
      <Drawer.Screen
        name={mainNavigations.PROFILE}
        component={MyMenuNavigator}
        options={{
          title: '마이메뉴',
        }}
      />
      <Drawer.Screen
        name={mainNavigations.NOTIFICATION} // 알림 화면 추가
        component={NotificationScreen}
        options={{
          title: '알림',
        }}
      />
    </Drawer.Navigator>
  );
}

export default MainDrawerNavigator;
