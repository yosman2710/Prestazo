import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  Calendar,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CreditCard
} from 'lucide-react-native';
import { RootStackParamList } from '../../navegation/type';
import { supabase } from '../../utils/supabase';
import { theme } from '../../utils/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PrestamoResumen = {
  id: string;
  client: string;
  amount: number;
  interest: number;
  totalPagado: number;
  dueDate: string;
  status: string;
  total: number;
  balance: number;
};

export default function LoanListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [loans, setLoans] = useState<PrestamoResumen[]>([]);
  const [loading, setLoading] = useState(true);

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
        const pagado = p.total_pagado >= (totalEsperado - 0.05);

        let nuevoEstado = 'activo';
        if (pagado) nuevoEstado = 'pagado';
        else if (vencido) nuevoEstado = 'vencido';

        if (nuevoEstado !== p.estado) {
          await supabase.from('prestamos').update({ estado: nuevoEstado }).eq('id', p.id);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const cargarPrestamos = async () => {
    try {
      const { data: rows, error } = await supabase
        .from('prestamos')
        .select(`
          id,
          monto,
          total_pagado,
          fecha_vencimiento,
          interes,
          estado,
          clientes (nombre)
        `)
        .order('fecha_vencimiento', { ascending: true });

      if (error) throw error;

      const transformados = (rows || []).map((p: any) => {
        const total = p.monto + (p.monto * p.interes) / 100;
        const balance = total - (p.total_pagado || 0);

        return {
          id: p.id.toString(),
          client: p.clientes?.nombre || 'Desconocido',
          amount: p.monto,
          interest: p.interes,
          totalPagado: p.total_pagado || 0,
          dueDate: p.fecha_vencimiento,
          status: p.estado,
          total,
          balance,
        };
      });

      setLoans(transformados);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los préstamos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      actualizarEstadosPrestamos().then(() => cargarPrestamos());
    }, [])
  );

  const filteredLoans = loans.filter((loan) => {
    const matchSearch = loan.client.toLowerCase().includes(search.toLowerCase());
    const matchFilter = selectedFilter === 'Todos' || loan.status === selectedFilter.toLowerCase();
    return matchSearch && matchFilter;
  });

  const formatearFecha = (iso: string) => {
    const fecha = new Date(iso);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}/${fecha.getFullYear()}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'activo':
        return { color: theme.colors.primary, bg: '#EEF2FF', label: 'ACTIVO' };
      case 'vencido':
        return { color: theme.colors.danger, bg: '#FEF2F2', label: 'VENCIDO' };
      case 'pagado':
        return { color: theme.colors.success, bg: '#ECFDF5', label: 'PAGADO' };
      default:
        return { color: theme.colors.textLight, bg: '#F8FAFC', label: 'DESCONOCIDO' };
    }
  };

  const LoanCard = ({ item }: { item: PrestamoResumen }) => {
    const config = getStatusConfig(item.status);
    const progress = Math.min(100, Math.round((item.totalPagado / item.total) * 100));

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('LoanDetailScreen', { prestamoId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.clientName}>{item.client}</Text>
            <View style={styles.dateRow}>
              <Calendar color={theme.colors.textLight} size={12} />
              <Text style={styles.dateText}>Vence: {formatearFecha(item.dueDate)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <View>
            <Text style={styles.amountLabel}>Saldo Pendiente</Text>
            <Text style={styles.amountValue}>${item.balance.toFixed(2)}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total: ${item.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso de Pago</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: config.color }]} />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.interestBadge}>
            <CreditCard color={theme.colors.textLight} size={12} />
            <Text style={styles.interestText}>{item.interest}% Interés</Text>
          </View>
          <View style={styles.actionLink}>
            <Text style={styles.actionLinkText}>Ver detalles</Text>
            <ChevronRight color={theme.colors.primary} size={16} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>Préstamos</Text>
            <Text style={styles.headerSubtitle}>{filteredLoans.length} registros en total</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateLoan', {})}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color={theme.colors.textLight} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={theme.colors.textLight}
          />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {['Todos', 'Activo', 'Vencido', 'Pagado'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === filter && styles.filterChipTextActive
                ]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredLoans}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LoanCard item={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AlertCircle color={theme.colors.textLight} size={48} />
                <Text style={styles.emptyText}>No se encontraron préstamos</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 48,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    paddingVertical: 16,
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalBox: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  interestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  interestText: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginLeft: 4,
    fontWeight: '600',
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLinkText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginRight: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textLight,
  },
});
