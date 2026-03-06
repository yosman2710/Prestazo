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
import { supabase } from '../../utils/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PrestamoVencido = {
  id: string;
  cliente: string;
  monto: number;
  vencimiento: string;
};

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();

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

      const { data: prestamos, error } = await supabase
        .from('prestamos')
        .select('id, monto, interes, total_pagado, fecha_vencimiento, estado')
        .neq('estado', 'pagado');

      if (error) throw error;

      for (const p of (prestamos || [])) {
        const totalEsperado = p.monto + (p.monto * p.interes) / 100;
        const vencido = new Date(p.fecha_vencimiento) < hoy;
        const pagado = p.total_pagado >= (totalEsperado - 0.01);

        let nuevoEstado = 'activo';
        if (pagado) nuevoEstado = 'pagado';
        else if (vencido) nuevoEstado = 'vencido';

        if (nuevoEstado !== p.estado) {
          await supabase
            .from('prestamos')
            .update({ estado: nuevoEstado })
            .eq('id', p.id);
        }
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
          // Calculate Totals
          const { data: loansData, error: loansError } = await supabase
            .from('prestamos')
            .select('monto, interes');

          if (loansError) throw loansError;

          const tPrestado = (loansData || []).reduce((acc, curr) =>
            acc + curr.monto + (curr.monto * curr.interes / 100), 0
          );
          setTotalPrestado(tPrestado);

          const { data: paymentsData, error: paymentsError } = await supabase
            .from('pagos')
            .select('monto');

          if (paymentsError) throw paymentsError;

          const tCobrado = (paymentsData || []).reduce((acc, curr) => acc + curr.monto, 0);
          setTotalCobrado(tCobrado);

          // Get Active Loans
          const { data: activos, error: activosError } = await supabase
            .from('prestamos')
            .select('id, monto, fecha_vencimiento, clientes(nombre)')
            .eq('estado', 'activo')
            .order('fecha_vencimiento', { ascending: true });

          if (activosError) throw activosError;

          setPrestamosActivos(activos?.length || 0);

          // Get upcoming expirations
          const { data: vencimientos, error: vencError } = await supabase
            .from('prestamos')
            .select('id, monto, fecha_vencimiento, clientes(nombre)')
            .order('fecha_vencimiento', { ascending: true })
            .limit(3);

          if (vencError) throw vencError;

          const proximos = (vencimientos || []).map((p: any) => ({
            id: p.id.toString(),
            cliente: p.clientes?.nombre || 'Desconocido',
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
      const { data: rows, error } = await supabase
        .from('prestamos')
        .select('id, monto, clientes(nombre)')
        .eq('estado', 'activo')
        .order('id', { ascending: true }); // Should ideally order by client name, but requires join ordering

      if (error) throw error;

      setPrestamosActivosList((rows || []).map((r: any) => ({
        id: r.id,
        cliente: r.clientes?.nombre || 'Desconocido',
        monto: r.monto
      })));
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
