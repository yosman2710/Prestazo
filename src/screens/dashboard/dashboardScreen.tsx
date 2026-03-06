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
import { LinearGradient } from 'expo-linear-gradient';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navegation/type';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import { theme } from '../../utils/theme';

import { useAuth } from '../../providers/AuthProvider';
import {
  LogOut,
  CreditCard,
  Users,
  AlertCircle,
  ChevronRight,
  Plus,
  DollarSign
} from 'lucide-react-native';



type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PrestamoVencido = {
  id: string;
  cliente: string;
  monto: number;
  vencimiento: string;
};

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signOut, user } = useAuth();



  const [prestamosVencimiento, setPrestamosVencimiento] = useState<PrestamoVencido[]>([]);
  const [prestamosHoy, setPrestamosHoy] = useState<PrestamoVencido[]>([]);
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

          // Get loans due TODAY
          const today = new Date().toISOString().split('T')[0];
          const { data: dueToday, error: dueTodayError } = await supabase
            .from('prestamos')
            .select('id, monto, fecha_vencimiento, clientes(nombre)')
            .eq('fecha_vencimiento', today)
            .neq('estado', 'pagado');

          if (dueTodayError) throw dueTodayError;

          const hoyList = (dueToday || []).map((p: any) => ({
            id: p.id.toString(),
            cliente: p.clientes?.nombre || 'Desconocido',
            monto: p.monto,
            vencimiento: 'Hoy',
          }));

          setPrestamosHoy(hoyList);

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            <Text style={styles.brandName}>Prestazo</Text>
            <Text style={styles.welcomeUser}>
              Hola, {user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <LogOut color={theme.colors.danger} size={22} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FlatList
        data={prestamosVencimiento}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.vencidoItem}
            onPress={() => navigation.navigate('LoanDetailScreen', { prestamoId: item.id })}
          >
            <View style={styles.vencidoLeft}>
              <Text style={styles.vencidoCliente}>{item.cliente}</Text>
              <Text style={styles.vencidoMonto}>Saldo: ${item.monto.toLocaleString()}</Text>
              <Text style={styles.vencidoFecha}>Vence: {item.vencimiento}</Text>
            </View>
            <View style={styles.vencidoAction}>
              <ChevronRight color={theme.colors.textLight} size={20} />
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.cardBlue }]}>
                <View style={styles.statIconContainer}>
                  <CreditCard color="#fff" size={24} />
                </View>
                <Text style={styles.statLabel}>Saldo Pendiente</Text>
                <Text style={styles.statValue}>${saldoPendiente.toLocaleString()}</Text>
                <View style={styles.statFooter}>
                  <Text style={styles.statFooterText}>{prestamosActivos} préstamos activos</Text>
                </View>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.cardGreen }]}>
                <View style={styles.statIconContainer}>
                  <Users color="#fff" size={24} />
                </View>
                <Text style={styles.statLabel}>Préstamos Activos</Text>
                <Text style={styles.statValue}>{prestamosActivos}</Text>
                <View style={styles.statFooter}>
                  <Text style={styles.statFooterText}>En curso</Text>
                </View>
              </View>
            </View>

            {prestamosHoy.length > 0 && (
              <View style={styles.dueTodaySection}>
                <LinearGradient
                  colors={['#FFF8F1', '#FFF4E5']}
                  style={styles.dueTodayGradient}
                >
                  <View style={styles.dueTodayHeader}>
                    <View style={styles.alertIcon}>
                      <AlertCircle color={theme.colors.cardOrange} size={20} />
                    </View>
                    <Text style={styles.dueTodayTitle}>Cobros para hoy</Text>
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>{prestamosHoy.length}</Text>
                    </View>
                  </View>
                  {prestamosHoy.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dueTodayItem}
                      onPress={() => navigation.navigate('LoanDetailScreen', { prestamoId: item.id })}
                    >
                      <View style={styles.dueTodayInfo}>
                        <Text style={styles.dueTodayClient}>{item.cliente}</Text>
                        <Text style={styles.dueTodayAmount}>${item.monto.toFixed(2)}</Text>
                      </View>
                      <View style={styles.cobrarBtn}>
                        <Text style={styles.cobrarBtnText}>Cobrar</Text>
                        <ChevronRight color="#fff" size={16} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </LinearGradient>
              </View>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Préstamos por vencer</Text>
              <TouchableOpacity onPress={abrirModalPrestamos}>
                <Text style={styles.seeAllText}>Registrar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('CreateLoan', {})}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
                  <Plus color={theme.colors.primary} size={24} />
                </View>
                <Text style={styles.quickActionText}>Nuevo Préstamo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={abrirModalPrestamos}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
                  <DollarSign color={theme.colors.success} size={24} />
                </View>
                <Text style={styles.quickActionText}>Registrar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          prestamosVencimiento.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No hay préstamos por vencer pronto.</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un préstamo</Text>
            <FlatList
              data={prestamosActivosList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('RegisterPayment', { prestamoId: item.id.toString() });
                  }}
                >
                  <Text style={styles.modalText}>
                    {item.cliente} — ${item.monto.toLocaleString()}
                  </Text>
                  <ChevronRight color={theme.colors.textLight} size={20} />
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  titleWrapper: {
    flex: 1,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  welcomeUser: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    padding: theme.spacing.sm,
    backgroundColor: '#FFF1F0',
    borderRadius: theme.borderRadius.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statFooter: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statFooterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '600',
  },
  dueTodaySection: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.cardOrange + '33',
    ...theme.shadows.sm,
  },
  dueTodayGradient: {
    padding: theme.spacing.md,
  },
  dueTodayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  alertIcon: {
    backgroundColor: '#FFF1CC',
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  dueTodayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  todayBadge: {
    backgroundColor: theme.colors.cardOrange,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dueTodayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  dueTodayInfo: {
    flex: 1,
  },
  dueTodayClient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  dueTodayAmount: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  cobrarBtn: {
    backgroundColor: theme.colors.cardOrange,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.borderRadius.md,
  },
  cobrarBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginRight: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  vencidoItem: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  vencidoLeft: {
    flex: 1,
  },
  vencidoCliente: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  vencidoMonto: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  vencidoFecha: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  vencidoAction: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  footerContainer: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  modalClose: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  modalCloseText: {
    color: theme.colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyList: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: theme.colors.textLight,
    fontSize: 16,
    textAlign: 'center',
  },
});


