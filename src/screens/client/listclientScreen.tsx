import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navegation/type';
import { theme } from '../../utils/theme';
import {
  Search,
  UserPlus,
  Phone,
  MapPin,
  ChevronRight,
  Trash2,
  Users as UsersIcon,
  CreditCard,
  CheckCircle2
} from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ClienteConPrestamos = {
  id: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  nota?: string;
  fecha_ingreso: string;
  loans: number;
  debt: number;
  paid: number;
};

import { supabase } from '../../utils/supabase';

export default function ClientListScreen() {
  const [clientes, setClientes] = useState<ClienteConPrestamos[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select(`
          *,
          prestamos (
            id,
            saldo,
            total_pagado
          )
        `)
        .order('fecha_ingreso', { ascending: false });

      if (error) throw error;

      const enriquecidos: ClienteConPrestamos[] = (data || []).map((cliente: any) => {
        const loans = cliente.prestamos || [];
        return {
          id: cliente.id.toString(),
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          nota: cliente.nota,
          fecha_ingreso: cliente.fecha_ingreso,
          loans: loans.length,
          debt: loans.reduce((acc: number, l: any) => acc + (l.saldo || 0), 0),
          paid: loans.reduce((acc: number, l: any) => acc + (l.total_pagado || 0), 0),
        };
      });

      setClientes(enriquecidos);
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
      Alert.alert('Error', error.message || 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarClientes();
    }, [])
  );

  const filteredClients = clientes.filter((client) =>
    client.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const eliminarCliente = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      cargarClientes();
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error);
      Alert.alert('Error', error.message || 'No se pudo eliminar el cliente');
    }
  };

  const totalClients = clientes.length;
  const withLoans = clientes.filter((c) => c.loans > 0).length;
  const activeLoans = clientes.reduce((acc, c) => acc + c.loans, 0);

  const handleDelete = (clientId: string) => {
    Alert.alert(
      '¿Eliminar cliente?',
      'Esta acción no se puede deshacer y eliminará también sus préstamos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarCliente(clientId),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.subtitle}>{totalClients} registrados</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateClient')}
        >
          <UserPlus color="#fff" size={20} />
          <Text style={styles.addButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color={theme.colors.textLight} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          placeholderTextColor={theme.colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClientCard client={item} navigation={navigation} onDelete={handleDelete} />
        )}
        ListHeaderComponent={
          <View style={styles.summaryRow}>
            <SummaryCard
              label="Total"
              value={totalClients}
              icon={<UsersIcon color={theme.colors.primary} size={20} />}
              bgColor="#EEF2FF"
            />
            <SummaryCard
              label="Deudores"
              value={withLoans}
              icon={<CreditCard color={theme.colors.cardOrange} size={20} />}
              bgColor="#FFF7ED"
            />
            <SummaryCard
              label="Liquidados"
              value={totalClients - withLoans}
              icon={<CheckCircle2 color={theme.colors.success} size={20} />}
              bgColor="#F0FDF4"
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={cargarClientes}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {search ? 'Sin resultados para la búsqueda' : 'No hay clientes registrados'}
              </Text>
            </View>
          )
        }

      />
    </SafeAreaView>
  );
}

const SummaryCard = ({ label, value, icon, bgColor }: { label: string; value: number | string; icon: any; bgColor: string }) => (
  <View style={[styles.summaryCard, { backgroundColor: bgColor }]}>
    <View style={styles.summaryIcon}>{icon}</View>
    <View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  </View>
);

const ClientCard = ({
  client,
  navigation,
  onDelete,
}: {
  client: ClienteConPrestamos;
  navigation: NavigationProp;
  onDelete: (id: string) => void;
}) => (
  <TouchableOpacity
    style={styles.clientCard}
    onPress={() => navigation.navigate('ClientDetails', { clientId: client.id })}
  >
    <View style={styles.cardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{client.nombre[0].toUpperCase()}</Text>
      </View>
      <View style={styles.clientHeaderInfo}>
        <Text style={styles.clientName}>{client.nombre}</Text>
        <View style={styles.contactRow}>
          <Phone color={theme.colors.textLight} size={12} />
          <Text style={styles.clientPhone}>{client.telefono}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => onDelete(client.id)} style={styles.deleteBtn}>
        <Trash2 color={theme.colors.danger} size={18} />
      </TouchableOpacity>
    </View>

    {client.direccion && (
      <View style={[styles.contactRow, { marginTop: 8 }]}>
        <MapPin color={theme.colors.textLight} size={12} />
        <Text style={styles.clientAddress} numberOfLines={1}>{client.direccion}</Text>
      </View>
    )}

    <View style={styles.cardFooter}>
      <View style={styles.badgeContainer}>
        <View style={[styles.badge, { backgroundColor: client.loans > 0 ? '#FEF3C7' : '#DCFCE7' }]}>
          <Text style={[styles.badgeText, { color: client.loans > 0 ? '#92400E' : '#166534' }]}>
            {client.loans > 0 ? `${client.loans} Activos` : 'Sin Préstamos'}
          </Text>
        </View>
      </View>
      {client.debt > 0 && (
        <View style={styles.debtContainer}>
          <Text style={styles.debtLabel}>Debe</Text>
          <Text style={styles.debtValue}>${client.debt.toLocaleString()}</Text>
        </View>
      )}
      <ChevronRight color={theme.colors.border} size={20} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: theme.colors.text,
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  summaryLabel: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 40,
  },
  clientCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  clientHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  clientPhone: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginLeft: 4,
  },
  clientAddress: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginLeft: 4,
    flex: 1,
  },
  deleteBtn: {
    padding: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  badgeContainer: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  debtContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  debtLabel: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  debtValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.danger,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});
