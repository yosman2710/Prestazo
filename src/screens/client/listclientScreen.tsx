import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styles from '../../style/client/listclientStyle';
import { RootStackParamList } from '../../navegation/type';

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

      const enriquecidos: ClienteConPrestamos[] = data.map((cliente: any) => {
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

      console.log(`Cliente ${clientId} eliminado`);
      cargarClientes(); // recarga la lista
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
      'Esta acción no se puede deshacer',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarCliente(clientId);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Clientes</Text>
      <Text style={styles.subtitle}>
        {filteredClients.length} clientes registrados
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar cliente..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.summaryRow}>
        <SummaryCard label="Total Clientes" value={totalClients} color="#2196F3" />
        <SummaryCard label="Con Préstamos" value={withLoans} color="#4CAF50" />
        <SummaryCard label="Préstamos Activos" value={activeLoans} color="#FF9800" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 40 }} />
      ) : filteredClients.length === 0 ? (
        <Text style={styles.emptyText}>No hay clientes registrados aún.</Text>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClientCard client={item} navigation={navigation} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigation.navigate('CreateClient')}
      >
        <Text style={styles.newButtonText}>+ Nuevo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const SummaryCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
  <View style={[styles.summaryCard, { borderLeftColor: color }]}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
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
  <View style={styles.clientCard}>
    <Text style={styles.clientName}>{client.nombre}</Text>
    <Text style={styles.clientInfo}>📞 {client.telefono}</Text>
    <Text style={styles.clientInfo}>📍 {client.direccion || 'Sin dirección'}</Text>
    <Text style={styles.clientInfo}>💳 Préstamos: {client.loans}</Text>

    <View style={styles.financialRow}>
      <Text style={styles.debt}>Debe: ${client.debt.toFixed(2)}</Text>
      <Text style={styles.paid}>Pagado: ${client.paid.toFixed(2)}</Text>
    </View>

    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => navigation.navigate('ClientDetails', { clientId: client.id })}
      >
        <Text style={styles.detailButtonText}>Ver Detalle</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loanButton}
        onPress={() => onDelete(client.id)}
      >
        <Text style={styles.loanButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </View>
);