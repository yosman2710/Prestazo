import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Phone,
  MapPin,
  FileText,
  Calendar,
  ChevronRight,
  Trash2,
  Edit3,
  ArrowLeft,
  CreditCard,
  History,
  AlertCircle
} from 'lucide-react-native';
import { supabase } from '../../utils/supabase';
import { theme } from '../../utils/theme';
import { RootStackParamList } from '../../navegation/type';
import { Prestamo, Cliente } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClientDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ClientDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { clientId } = route.params;

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: clienteBase, error: clientError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      const { data: prestamos, error: loansError } = await supabase
        .from('prestamos')
        .select('*')
        .eq('cliente_id', clientId)
        .order('fecha_inicio', { ascending: false });

      if (loansError) throw loansError;

      if (clienteBase) {
        setCliente({
          id: clientId,
          nombre: clienteBase.nombre,
          telefono: clienteBase.telefono,
          direccion: clienteBase.direccion ?? '',
          nota: clienteBase.nota ?? '',
          fechaIngreso: clienteBase.fecha_ingreso,
          prestamos: prestamos || [],
        });
      }
    } catch (error: any) {
      console.error('Error al cargar cliente:', error);
      Alert.alert('Error', error.message || 'No se pudo cargar la información del cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [clientId]);

  const eliminarCliente = async () => {
    if (!cliente) return;

    if (cliente.prestamos.some(p => p.estado === 'activo')) {
      Alert.alert('No permitido', 'Este cliente tiene préstamos activos. Liquide los préstamos antes de eliminar al cliente.');
      return;
    }

    Alert.alert(
      '¿Eliminar cliente?',
      'Esta acción eliminará permanentemente al cliente y su historial de pagos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('id', cliente.id);

              if (error) throw error;
              navigation.goBack();
            } catch (error: any) {
              console.error('Error al eliminar cliente:', error);
              Alert.alert('Error', 'No se pudo eliminar el cliente');
            }
          },
        },
      ]
    );
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return theme.colors.cardOrange;
      case 'pagado': return theme.colors.success;
      case 'vencido': return theme.colors.danger;
      default: return theme.colors.textLight;
    }
  };

  if (!cliente) return null;

  const prestamosActivos = cliente.prestamos.filter((p: any) => p.estado === 'activo').length;
  const saldoTotal = cliente.prestamos.reduce((acc: number, p: any) => acc + (p.saldo || 0), 0);
  const totalPagado = cliente.prestamos.reduce((acc: number, p: any) => acc + (p.total_pagado || 0), 0);

  const formatearFecha = (iso: string) => {
    const fecha = new Date(iso);
    return fecha.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[theme.colors.primary, '#0052D4']}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <View style={styles.headerRightActions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditClient', { clientId: cliente.id })}
                  style={styles.headerBtn}
                >
                  <Edit3 color="#fff" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={eliminarCliente} style={styles.headerBtn}>
                  <Trash2 color="#fff" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          <View style={styles.profileInfo}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarTextLarge}>{cliente.nombre[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.clientNameLarge}>{cliente.nombre}</Text>
            <View style={styles.entryDateContainer}>
              <Calendar color="rgba(255,255,255,0.7)" size={14} />
              <Text style={styles.entryDateText}>Desde {formatearFecha(cliente.fechaIngreso)}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <CreditCard color={theme.colors.cardOrange} size={20} />
              <Text style={styles.statValue}>${saldoTotal.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Saldo Total</Text>
            </View>
            <View style={styles.statCard}>
              <History color={theme.colors.success} size={20} />
              <Text style={styles.statValue}>${totalPagado.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Pagado</Text>
            </View>
            <View style={styles.statCard}>
              <AlertCircle color={theme.colors.primary} size={20} />
              <Text style={styles.statValue}>{prestamosActivos}</Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Phone color={theme.colors.primary} size={18} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabelText}>Teléfono</Text>
                  <Text style={styles.infoValueText}>{cliente.telefono}</Text>
                </View>
              </View>

              {cliente.direccion && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MapPin color={theme.colors.primary} size={18} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabelText}>Dirección</Text>
                    <Text style={styles.infoValueText}>{cliente.direccion}</Text>
                  </View>
                </View>
              )}

              {cliente.nota && (
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.infoIcon}>
                    <FileText color={theme.colors.primary} size={18} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabelText}>Notas</Text>
                    <Text style={styles.infoValueText}>{cliente.nota}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Historial de Préstamos</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateLoan', { clientId: cliente.id })}>
                <Text style={styles.addLoanText}>+ Nuevo</Text>
              </TouchableOpacity>
            </View>

            {cliente.prestamos.length === 0 ? (
              <View style={styles.emptyLoans}>
                <Text style={styles.emptyLoansText}>No hay préstamos registrados</Text>
              </View>
            ) : (
              cliente.prestamos.map((p: any) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.loanItem}
                  onPress={() => navigation.navigate('LoanDetailScreen', { prestamoId: p.id })}
                >
                  <View style={styles.loanInfo}>
                    <Text style={styles.loanId}>Préstamo #{p.id.toString().slice(-4)}</Text>
                    <Text style={styles.loanAmount}>${p.monto.toLocaleString()}</Text>
                    <Text style={styles.loanDate}>{formatearFecha(p.fecha_inicio)}</Text>
                  </View>
                  <View style={styles.loanStatusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(p.estado) + '20' }]}>
                      <Text style={[styles.statusText, { color: getEstadoColor(p.estado) }]}>
                        {p.estado.toUpperCase()}
                      </Text>
                    </View>
                    <ChevronRight color={theme.colors.border} size={20} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarTextLarge: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  clientNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  entryDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  entryDateText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  content: {
    padding: theme.spacing.md,
    marginTop: -20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  addLoanText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 5,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabelText: {
    fontSize: 11,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  infoValueText: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  loanItem: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.xs,
  },
  loanInfo: {
    flex: 1,
  },
  loanId: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  loanAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 2,
  },
  loanDate: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  loanStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyLoans: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyLoansText: {
    color: theme.colors.textLight,
    fontSize: 14,
  },
});
