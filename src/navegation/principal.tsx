import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/dashboard/dashboardScreen';
import LoanListScreen from '../screens/prestamos/listPrestamos';
import ClientListScreen from '../screens/client/listclientScreen';
import { FontAwesome } from '@expo/vector-icons'; // 👈 Import correcto

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => {
        let iconName: keyof typeof FontAwesome.glyphMap;

        if (route.name === 'Dashboard') {
          iconName = 'home';
        } else if (route.name === 'Prestamos') {
          iconName = 'money';
        } else if (route.name === 'Clientes') {
          iconName = 'user';
        }

        return {
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name={iconName} size={size} color={color} />
          ),
          tabBarActiveTintColor: '#153dc2ff',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Prestamos" component={LoanListScreen} />
      <Tab.Screen name="Clientes" component={ClientListScreen} />
    </Tab.Navigator>
  );
}
