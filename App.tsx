import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { StyleSheet } from 'react-native';

import TabNavigator from './src/navegation/principal';
import CreateLoanScreen from './src/screens/prestamos/createPrestamo';
import CreateClientScreen from './src/screens/client/createClient';
import ClientDetailScreen from './src/screens/client/ClientDetails';
import LoanDetailScreen from './src/screens/prestamos/LoanDetailScreen';
import RegisterPaymentScreen from './src/screens/prestamos/RegisterPayment';
import EditClientScreen from './src/screens/client/editClient';

enableScreens();
const Stack = createNativeStackNavigator();
export default function App() {

const createDbifneeded = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha_ingreso TEXT NOT NULL,
        nombre TEXT NOT NULL,
        telefono TEXT,
        direccion TEXT,
        nota TEXT
      );
    `);
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS prestamos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      monto REAL NOT NULL,
      saldo REAL NOT NULL,
      total_pagado REAL NOT NULL DEFAULT 0,
      interes REAL NOT NULL,
      fecha_inicio TEXT NOT NULL,
      fecha_vencimiento TEXT NOT NULL,
      frecuencia TEXT NOT NULL,
      cantidad_cuotas INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'activo',
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prestamo_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      monto REAL NOT NULL,
      nota TEXT,
      FOREIGN KEY (prestamo_id) REFERENCES prestamos(id)
    );
  `);
    console.log('Tabla clientes verificada o creada');
  } catch (error) {
    console.error('Error al crear/verificar tabla clientes:', error);
  }
};

  return (
    <SQLiteProvider databaseName="Prestazo.db" onInit={createDbifneeded}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="MainTabs">
          <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="CreateLoan" component={CreateLoanScreen} options={screenOptions('Nuevo Préstamo')} />
          <Stack.Screen name="CreateClient" component={CreateClientScreen} options={screenOptions('Nuevo Cliente')} />
          <Stack.Screen name="ClientDetails" component={ClientDetailScreen} options={screenOptions('Detalles del Cliente')} />
          <Stack.Screen name="LoanDetailScreen" component={LoanDetailScreen} options={screenOptions('Detalles del Préstamo')} />
          <Stack.Screen name="RegisterPayment" component={RegisterPaymentScreen} options={screenOptions('Registrar Pago')} />
          <Stack.Screen name="EditClient" component={EditClientScreen} options={screenOptions('Editar Cliente')} />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}

const screenOptions = (title: string) => ({
  headerShown: true,
  title,
  headerStyle: { backgroundColor: '#E6F4F1' },
  headerTintColor: '#003366',
  headerTitleStyle: styles.headerTitle,
});

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: 'bold',
    color: '#003366',
  },
});