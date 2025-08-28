import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navegation/type';
import { useSQLiteContext } from 'expo-sqlite';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PrestamoResumen = {
  id: string;
  client: string;
  amount: number;
  interest: number;
  totalPagado: number;
  dueDate: string;
  status: string;
};

export default function LoanListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const db = useSQLiteContext();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [loans, setLoans] = useState<
    (PrestamoResumen & { total: number; balance: number })[]
  >([]);
  const [loading, setLoading] = useState(true);

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

  const cargarPrestamos = async () => {
    try {
      const rows = await db.getAllAsync(`
        SELECT 
          p.id,
          c.nombre AS client,
          p.monto,
          p.total_pagado,
          p.fecha_vencimiento AS dueDate,
          p.interes,
          p.estado AS status
        FROM prestamos p
        JOIN clientes c ON c.id = p.cliente_id
        ORDER BY p.fecha_vencimiento ASC
      `) as {
        id: number;
        client: string;
        monto: number;
        total_pagado: number;
        dueDate: string;
        interes: number;
        status: string;
      }[];

      const transformados = rows.map((p) => {
        const total = p.monto + (p.monto * p.interes) / 100;
        const balance = total - p.total_pagado;

        return {
          id: p.id.toString(),
          client: p.client,
          amount: p.monto,
          interest: p.interes,
          totalPagado: p.total_pagado,
          dueDate: p.dueDate,
          status: p.status,
          total,
          balance,
        };
      });

      setLoans(transformados);
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      Alert.alert('Error', 'No se pudieron cargar los préstamos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      actualizarEstadosPrestamos();
      cargarPrestamos();
    }, [])
  );

  const filteredLoans = loans.filter((loan) => {
    const matchSearch = loan.client.toLowerCase().includes(search.toLowerCase());
    const matchFilter = selectedFilter === 'Todos' || loan.status === selectedFilter;
    return matchSearch && matchFilter;
  });

  const formatearFecha = (iso: string) => {
    const fecha = new Date(iso);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${fecha.getFullYear()}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Activo':
        return { backgroundColor: '#4CAF50' };
      case 'Vencido':
        return { backgroundColor: '#F44336' };
      case 'Pagado':
        return { backgroundColor: '#2196F3' };
      default:
        return { backgroundColor: '#9E9E9E' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Préstamos</Text>
      <Text style={styles.subtitle}>{filteredLoans.length} préstamos encontrados</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por cliente..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['Todos', 'Activo', 'Vencido', 'Pagado'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredLoans.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#555' }}>
          No hay préstamos registrados.
        </Text>
      ) : (
        <FlatList
          data={filteredLoans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.clientName}>{item.client}</Text>
                <Text style={[styles.status, getStatusStyle(item.status)]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.cardText}>Monto Total: ${item.total.toFixed(2)}</Text>
              <Text style={styles.cardText}>Saldo Pendiente: ${item.balance.toFixed(2)}</Text>
              <Text style={styles.cardText}>Fecha Vencimiento: {formatearFecha(item.dueDate)}</Text>
              <Text style={styles.cardText}>Interés: {item.interest}%</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    navigation.navigate('LoanDetailScreen', { prestamoId: item.id })
                  }
                >
                  <Text style={styles.detailButtonText}>Ver Detalle</Text>
                </TouchableOpacity>
                {item.status !== 'Pagado' && (
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() =>
                      navigation.navigate('RegisterPayment', { prestamoId: item.id })
                    }
                  >
                    <Text style={styles.payButtonText}>Pago</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigation.navigate('CreateLoan')}
      >
        <Text style={styles.newButtonText}>+ Nuevo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4F1',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  filterContainer: {
  flexDirection: 'row',
  marginBottom: 18,
  paddingVertical: 4, 
  height: 52,       
},

  filterButton: {
    height: 36,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },  
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterText: {
    color: '#333',
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  status: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 4,
    width: 80, // 👈 ancho fijo para mantener forma
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailButton: {
    backgroundColor: '#FFEB3B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  detailButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
