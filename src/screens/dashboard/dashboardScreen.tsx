import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navegation/type';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PrestamoVencido = {
  id: string;
  cliente: string;
  monto: number;
  vencimiento: string;
};

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const db = useSQLiteContext();

  const [prestamosVencimiento, setPrestamosVencimiento] = useState<PrestamoVencido[]>([]);
  const [prestamosActivos, setPrestamosActivos] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [prestamosActivosList, setPrestamosActivosList] = useState<
    { id: number; cliente: string; monto: number }[]
  >([]);
  const [totalPrestado, setTotalPrestado] = useState(0);
  const [totalCobrado, setTotalCobrado] = useState(0);

  const actualizarEstadosPrestamos = async () => {
    try {
      const hoy = new Date();

      const prestamos = await db.getAllAsync(
        `SELECT id, monto, interes, total_pagado, fecha_vencimiento
         FROM prestamos
         WHERE estado != 'Pagado'`
      ) as {
        id: number;
        monto: number;
        interes: number;
        total_pagado: number;
        fecha_vencimiento: string;
      }[];

      for (const p of prestamos) {
        const totalEsperado = p.monto + (p.monto * p.interes) / 100;
        const vencido = new Date(p.fecha_vencimiento) < hoy;
        const pagado = p.total_pagado >= totalEsperado;

        let nuevoEstado = 'Activo';
        if (pagado) nuevoEstado = 'Pagado';
        else if (vencido) nuevoEstado = 'Vencido';

        await db.runAsync(`UPDATE prestamos SET estado = ? WHERE id = ?`, [
          nuevoEstado,
          p.id,
        ]);
      }
    } catch (error) {
      console.error('Error actualizando estados de préstamos:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const cargarDatos = async () => {
        await actualizarEstadosPrestamos();
        try {
        const obtenerTotalSeguro = (row: { total: number | null }) => {
  return typeof row.total === 'number' && !isNaN(row.total) ? row.total : 0;
};

const totalPrestadoRow = await db.getFirstAsync(
  `SELECT SUM(monto + (monto * interes / 100)) as total FROM prestamos`
) as { total: number | null };

const totalCobradoRow = await db.getFirstAsync(
  `SELECT SUM(monto) as total FROM pagos`
) as { total: number | null };

setTotalPrestado(obtenerTotalSeguro(totalPrestadoRow));
setTotalCobrado(obtenerTotalSeguro(totalCobradoRow));

          const activos = await db.getAllAsync(
            `SELECT p.id, c.nombre AS cliente, p.monto, p.fecha_vencimiento
             FROM prestamos p
             JOIN clientes c ON c.id = p.cliente_id
             WHERE p.estado = 'Activo'
             ORDER BY p.fecha_vencimiento ASC`
          ) as { id: number; cliente: string; monto: number; fecha_vencimiento: string }[];

          setPrestamosActivos(activos.length);

          const vencimientos = await db.getAllAsync(
            `SELECT p.id, c.nombre AS cliente, p.monto, p.fecha_vencimiento
             FROM prestamos p
             JOIN clientes c ON c.id = p.cliente_id
             ORDER BY p.fecha_vencimiento ASC
             LIMIT 3`
          ) as { id: number; cliente: string; monto: number; fecha_vencimiento: string }[];

          const proximos = vencimientos.map((p) => ({
            id: p.id.toString(),
            cliente: p.cliente,
            monto: p.monto,
            vencimiento: formatearFechaCorta(p.fecha_vencimiento),
          }));

          setPrestamosVencimiento(proximos);
        } catch (error) {
          console.error('Error al cargar datos del dashboard:', error);
        }
      };

      cargarDatos();
    }, [])
  );

  const formatearFechaCorta = (iso: string) => {
    const fecha = new Date(iso);
    return fecha.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
    });
  };

  const abrirModalPrestamos = async () => {
    try {
      const rows = await db.getAllAsync(
        `SELECT p.id, c.nombre AS cliente, p.monto
         FROM prestamos p
         JOIN clientes c ON c.id = p.cliente_id
         WHERE p.estado = 'Activo'
         ORDER BY c.nombre ASC`
      ) as { id: number; cliente: string; monto: number }[];

      setPrestamosActivosList(rows);
      setModalVisible(true);
    } catch (error) {
      console.error('Error al cargar préstamos activos:', error);
    }
  };

  const saldoPendiente = totalPrestado - totalCobrado;

  return (
    <>
      <FlatList
        data={prestamosVencimiento}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.vencidoItem}>
            <Text style={styles.vencidoText}>
              {item.cliente} — ${item.monto} — {item.vencimiento}
            </Text>
            <TouchableOpacity
              style={styles.verDetalleButton}
              onPress={() => navigation.navigate('LoanDetailScreen', { prestamoId: item.id })}
            >
              <Text style={styles.verDetalleText}>Ver Detalle</Text>
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={
          <SafeAreaView style={styles.headerContainer}>
            <Text style={styles.title}>Prestazo</Text>

            <View style={styles.podredumbre}>
              <View style={StyleSheet.compose(styles.card, styles.cardBlue)}>
                <Text style={styles.cardTitle}>Total Prestado</Text>
                <Text style={styles.cardAmount}>${totalPrestado.toFixed(2)}</Text>
                <Text style={styles.cardSub}>Este mes</Text>
              </View>

              <View style={StyleSheet.compose(styles.card, styles.cardGreen)}>
                <Text style={styles.cardTitle}>Total Cobrado</Text>
                <Text style={styles.cardAmount}>${totalCobrado.toFixed(2)}</Text>
                <Text style={styles.cardSub}>Este mes</Text>
              </View>
            </View>

            <View style={styles.podredumbre}>
              <View style={StyleSheet.compose(styles.card, styles.cardOrange)}>
                <Text style={styles.cardTitle}>Saldo Pendiente</Text>
                <Text style={styles.cardAmount}>${saldoPendiente.toFixed(2)}</Text>
                <Text style={styles.cardSub}>{prestamosActivos} préstamos activos</Text>
              </View>

              <View style={StyleSheet.compose(styles.card, styles.cardWhite)}>
                <Text style={styles.cardTitleDark}>Préstamos Activos</Text>
                <Text style={styles.cardAmountDark}>{prestamosActivos}</Text>
                <Text style={styles.cardSubDark}>En curso</Text>
              </View>
            </View>

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
                onPress={abrirModalPrestamos}
              >
                <Text style={styles.buttonText}>$ Registrar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={styles.container}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un préstamo</Text>
            {prestamosActivosList.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.modalItem}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('RegisterPayment', { prestamoId: p.id.toString() });
                }}
              >
                <Text style={styles.modalText}>
                  {p.cliente} — ${p.monto}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
    color: '#003366',
    textAlign: 'center',
  },
  podredumbre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 0.48,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardBlue: {
    backgroundColor: '#4A90E2',
  },
  cardGreen: {
    backgroundColor: '#50C878',
  },
  cardOrange: {
    backgroundColor: '#FFA500',
  },
  cardWhite: {
    backgroundColor: '#fff',
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
    color: '#003366',
  },
  vencidoItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  vencidoText: {
    fontSize: 16,
    color: '#333',
  },
  verDetalleButton: {
    marginTop: 6,
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verDetalleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#003366',
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  modalClose: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
