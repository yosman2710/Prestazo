import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Trash2,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  CreditCard
} from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { RootStackParamList } from '../../navegation/type';
import { theme } from '../../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoanDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'LoanDetailScreen'>>();
  const { prestamoId } = route.params;

  const [prestamo, setPrestamo] = useState<any>(null);
  const [pagos, setPagos] = useState<{ fecha: string; monto: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [añoActual, setAñoActual] = useState(new Date().getFullYear());

  useEffect(() => {
    cargarDatos();
  }, [prestamoId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: p, error: pError } = await supabase
        .from('prestamos')
        .select(`
          *,
          clientes (nombre)
        `)
        .eq('id', prestamoId)
        .single();

      if (pError) throw pError;

      setPrestamo({
        ...p,
        cliente: p.clientes?.nombre
      });

      const { data: pagosRealizados, error: pagosError } = await supabase
        .from('pagos')
        .select('fecha, monto')
        .eq('prestamo_id', prestamoId)
        .order('fecha', { ascending: true });

      if (pagosError) throw pagosError;
      setPagos(pagosRealizados || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar la información del préstamo');
    } finally {
      setLoading(false);
    }
  };

  const avanzarMes = () => {
    if (mesActual === 12) {
      setMesActual(1);
      setAñoActual(añoActual + 1);
    } else {
      setMesActual(mesActual + 1);
    }
  };

  const retrocederMes = () => {
    if (mesActual === 1) {
      setMesActual(12);
      setAñoActual(añoActual - 1);
    } else {
      setMesActual(mesActual - 1);
    }
  };

  const obtenerDiasDelMes = (mes: number, año: number) => {
    const dias: { fecha: string; dia: number }[] = [];
    const primerDia = new Date(año, mes - 1, 1);
    const ultimoDia = new Date(año, mes, 0);
    const totalDias = ultimoDia.getDate();
    const offset = primerDia.getDay();

    for (let i = 0; i < offset; i++) {
      dias.push({ fecha: '', dia: 0 });
    }

    for (let d = 1; d <= totalDias; d++) {
      const fecha = new Date(año, mes - 1, d);
      dias.push({
        fecha: fecha.toISOString().slice(0, 10),
        dia: d,
      });
    }
    return dias;
  };

  const generarFechasEsperadas = (
    inicio: string,
    frecuencia: string,
    cuotas: number
  ): string[] => {
    const fechas: string[] = [];
    const base = new Date(inicio);
    const diasPorCuota = { Diario: 1, Semanal: 7, Quincenal: 15, Mensual: 30 };
    const incremento = diasPorCuota[frecuencia as keyof typeof diasPorCuota] ?? 0;

    for (let i = 0; i < cuotas; i++) {
      const fecha = new Date(base);
      fecha.setDate(base.getDate() + i * incremento);
      fechas.push(fecha.toISOString().slice(0, 10));
    }
    return fechas;
  };

  const formatearFecha = (iso: string) => {
    const fecha = new Date(iso);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
  };

  const eliminarPrestamo = async () => {
    Alert.alert(
      'Eliminar Préstamo',
      '¿Estás seguro de que deseas eliminar este préstamo? Se eliminarán también todos los pagos asociados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.from('pagos').delete().eq('prestamo_id', prestamoId);
              await supabase.from('prestamos').delete().eq('id', prestamoId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo eliminar el préstamo');
            }
          },
        },
      ]
    );
  };

  if (loading) return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  if (!prestamo) return null;

  const montoTotal = prestamo.monto + (prestamo.monto * prestamo.interes) / 100;
  const saldoPendiente = montoTotal - (prestamo.total_pagado || 0);
  const pagosEsperados = generarFechasEsperadas(prestamo.fecha_inicio, prestamo.frecuencia, prestamo.cantidad_cuotas);
  const pagosRealizadosFechas = pagos.map((p) => p.fecha.slice(0, 10));
  const progreso = Math.min(100, Math.round(((prestamo.total_pagado || 0) / montoTotal) * 100));
  const diasDelMes = obtenerDiasDelMes(mesActual, añoActual);
  const nombreMes = new Date(añoActual, mesActual - 1).toLocaleString('es-ES', { month: 'long' });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={eliminarPrestamo} style={styles.deleteIconButton}>
              <Trash2 color="#fff" size={22} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <View style={styles.clientInfo}>
              <View style={styles.avatar}>
                <User color="#fff" size={30} />
              </View>
              <View>
                <Text style={styles.clientName}>{prestamo.cliente}</Text>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: prestamo.estado === 'activo' ? theme.colors.success : theme.colors.textLight }]} />
                  <Text style={styles.statusText}>{prestamo.estado.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Main Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
              <DollarSign color={theme.colors.primary} size={20} />
              <Text style={styles.statLabel}>Total a Pagar</Text>
              <Text style={styles.statValue}>${montoTotal.toFixed(2)}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
              <TrendingUp color={theme.colors.success} size={20} />
              <Text style={styles.statLabel}>Saldo Pendiente</Text>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>${saldoPendiente.toFixed(2)}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progreso de Pago</Text>
              <Text style={styles.progressValue}>{progreso}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progreso}%` }]} />
            </View>
          </View>

          {/* Loan Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Detalles del Préstamo</Text>
            <View style={styles.detailItem}>
              <Clock color={theme.colors.textLight} size={18} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Frecuencia</Text>
                <Text style={styles.detailValue}>{prestamo.frecuencia}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <CalendarIcon color={theme.colors.textLight} size={18} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Vencimiento</Text>
                <Text style={styles.detailValue}>{formatearFecha(prestamo.fecha_vencimiento)}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <CreditCard color={theme.colors.textLight} size={18} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Tasa de Interés</Text>
                <Text style={styles.detailValue}>{prestamo.interes}%</Text>
              </View>
            </View>
          </View>

          {/* Calendar */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendario de Pagos</Text>
          </View>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarControls}>
              <TouchableOpacity onPress={retrocederMes} style={styles.navIcon}>
                <ChevronLeft color={theme.colors.text} size={20} />
              </TouchableOpacity>
              <Text style={styles.monthName}>
                {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} {añoActual}
              </Text>
              <TouchableOpacity onPress={avanzarMes} style={styles.navIcon}>
                <ChevronRight color={theme.colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((dia, i) => (
                <Text key={i} style={styles.dayHeaderLabel}>{dia}</Text>
              ))}
              {diasDelMes.map(({ fecha, dia }, index) => {
                let statusColor = 'transparent';
                let textColor = theme.colors.text;

                if (dia === 0) return <View key={index} style={styles.dayBox} />;

                if (pagosRealizadosFechas.includes(fecha)) {
                  statusColor = theme.colors.success;
                  textColor = '#fff';
                } else if (pagosEsperados.includes(fecha)) {
                  const vencido = new Date(fecha) < new Date();
                  statusColor = vencido ? theme.colors.danger : theme.colors.warning;
                  textColor = '#fff';
                }

                return (
                  <View key={index} style={styles.dayBox}>
                    <View style={[styles.dayIndicator, { backgroundColor: statusColor }]}>
                      <Text style={[styles.dayText, { color: textColor }]}>{dia}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                <Text style={styles.legendText}>Pagado</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={styles.legendText}>Pendiente</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
                <Text style={styles.legendText}>Atrasado</Text>
              </View>
            </View>
          </View>

          {/* History */}
          <Text style={styles.sectionTitle}>Historial de Pagos</Text>
          <View style={styles.historyList}>
            {pagos.length === 0 ? (
              <View style={styles.emptyState}>
                <AlertCircle color={theme.colors.textLight} size={40} />
                <Text style={styles.emptyText}>No hay pagos registrados</Text>
              </View>
            ) : (
              pagos.map((pago, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <CheckCircle2 color={theme.colors.success} size={20} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{formatearFecha(pago.fecha)}</Text>
                    <Text style={styles.historyStatus}>Pago realizado exitosamente</Text>
                  </View>
                  <Text style={styles.historyAmount}>+${pago.monto.toFixed(2)}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clientName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -20,
    marginBottom: 24,
  },
  statCard: {
    flex: 0.48,
    padding: 16,
    borderRadius: 20,
    ...theme.shadows.sm,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    ...theme.shadows.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    ...theme.shadows.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailInfo: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 24,
    marginBottom: 24,
    ...theme.shadows.sm,
  },
  calendarControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navIcon: {
    padding: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
  },
  monthName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeaderLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textLight,
    marginBottom: 10,
  },
  dayBox: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayIndicator: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  historyList: {
    marginBottom: 30,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    ...theme.shadows.xs,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  historyStatus: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    marginTop: 10,
    color: theme.colors.textLight,
    fontSize: 14,
  },
});

