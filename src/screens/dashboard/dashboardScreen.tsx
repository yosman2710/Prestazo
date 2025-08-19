import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navegation/type'; // ajusta la ruta si lo tienes en otro lado
import { SafeAreaView } from 'react-native-safe-area-context';




type PrestamoVencido = {
  id: string;
  cliente: string;
  monto: number;
  vencimiento: string;
};

const prestamosPorVencer: PrestamoVencido[] = [
  { id: '1', cliente: 'Juan Pérez', monto: 200, vencimiento: '15 Ago' },
  { id: '2', cliente: 'María López', monto: 150, vencimiento: '16 Ago' },
  { id: '3', cliente: 'Carlos Ruiz', monto: 300, vencimiento: '17 Ago' },
   { id: '4', cliente: 'Juan Pérez', monto: 200, vencimiento: '15 Ago' },
  { id: '5', cliente: 'María López', monto: 150, vencimiento: '16 Ago' },
  { id: '6', cliente: 'Carlos Ruiz', monto: 300, vencimiento: '17 Ago' },
];
const prestamosActivos = 23;

export default function DashboardScreen() {
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <FlatList
      data={prestamosPorVencer}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.vencidoItem}>
          <Text style={styles.vencidoText}>
            {item.cliente} - ${item.monto} - {item.vencimiento}
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <SafeAreaView style={styles.headerContainer}>
          <Text style={styles.title}>Prestazo</Text>

          {/* Tarjetas de resumen */}
           <View style={styles.podredumbre}>
          <View style={StyleSheet.compose(styles.card, styles.cardBlue)}>
            <Text style={styles.cardTitle}>Total Prestado</Text>
            <Text style={styles.cardAmount}>$125,430</Text>
            <Text style={styles.cardSub}>Este mes</Text>
          </View>

          <View style={StyleSheet.compose(styles.card, styles.cardGreen)}>
            <Text style={styles.cardTitle}>Total Cobrado</Text>
            <Text style={styles.cardAmount}>$89,320</Text>
            <Text style={styles.cardSub}>Este mes</Text>
          </View>
          </View>
<View style={styles.podredumbre}>
          <View style={StyleSheet.compose(styles.card, styles.cardOrange)}>
            <Text style={styles.cardTitle}>Saldo Pendiente</Text>
            <Text style={styles.cardAmount}>$36,110</Text>
            <Text style={styles.cardSub}>23 préstamos activos</Text>
          </View>

          <View style={StyleSheet.compose(styles.card, styles.cardWhite)}>
            <Text style={styles.cardTitleDark}>Préstamos Activos</Text>
            <Text style={styles.cardAmountDark}>{prestamosActivos}</Text>
            <Text style={styles.cardSubDark}>En curso</Text>
          </View>
</View>
          {/* Sección de vencimientos */}
          <Text style={styles.sectionTitle}>Préstamos por vencer</Text>
        </SafeAreaView>
      }
      ListFooterComponent={
        <View style={styles.footerContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.buttonYellow}
              onPress={() => navigation.navigate('CreateLoan')}
            >
              <Text style={styles.buttonText}>+ Nuevo Préstamo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonYellow}
              onPress={() => console.log('Ir a registrar pago')}
            >
              <Text style={styles.buttonText}>$ Registrar Pago</Text>
            </TouchableOpacity>

          </View>
        </View>
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#E6F4F1',
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 10,
  },
  footerContainer: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,

  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  card: {
  flex: 0.48,
  padding: 15,
  borderRadius: 10,
  marginBottom: 10,
},

  cardBlue: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardGreen: {
    backgroundColor: '#50C878',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardOrange: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardWhite: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardAmount: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#fff',
    fontSize: 14,
  },

  cardTitleDark: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardAmountDark: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardSubDark: {
    color: '#666',
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  vencidoItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  vencidoText: {
    color: '#333',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonYellow: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
  },
  podredumbre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

});
