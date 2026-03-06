import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import DashboardScreen from '../screens/dashboard/dashboardScreen';
import LoanListScreen from '../screens/prestamos/listPrestamos';
import ClientListScreen from '../screens/client/listclientScreen';
import { LayoutDashboard, Wallet, Users } from 'lucide-react-native';
import { theme } from '../utils/theme';

const Tab = createMaterialTopTabNavigator();

function MyTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused ? theme.colors.primary : '#94a3b8';
        const iconSize = isFocused ? 26 : 22;

        let IconComponent;
        if (route.name === 'Dashboard') {
          IconComponent = <LayoutDashboard color={color} size={iconSize} />;
        } else if (route.name === 'Prestamos') {
          IconComponent = <Wallet color={color} size={iconSize} />;
        } else if (route.name === 'Clientes') {
          IconComponent = <Users color={color} size={iconSize} />;
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabBarItem}
          >
            {IconComponent}
            <Text style={[styles.tabBarLabel, { color }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBarPosition="bottom"
      tabBar={(props) => <MyTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Prestamos" component={LoanListScreen} />
      <Tab.Screen name="Clientes" component={ClientListScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    paddingTop: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...theme.shadows.lg,
    elevation: 20,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.1,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
