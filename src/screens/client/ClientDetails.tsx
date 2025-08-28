import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { RootStackParamList } from '../../navegation/type';
import { Prestamo, Cliente } from '../../types';

export default function ClientDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ClientDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const db = useSQLiteContext();
  const { clientId } = route.params;

  const [cliente, setCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const clienteBase = await db.getFirstAsync(
          `SELECT * FROM clientes WHERE id = ?`,
          [clientId]
        ) as {
          nombre: string;
          telefono: string;
          direccion?: string;
          nota?: string;
          fecha_ingreso: string;
        } | undefined;

        const prestamos = await db.getAllAsync(
          `SELECT * FROM prestamos WHERE cliente_id = ? ORDER BY fecha_inicio DESC`,
          [clientId]
        ) as Prestamo[];

        if (clienteBase) {
          setCliente({
            id: clientId,
            nombre: clienteBase.nombre,
            telefono: clienteBase.telefono,
            direccion: clienteBase.direccion ?? '',
            nota: clienteBase.nota ?? '',
            fechaIngreso: clienteBase.fecha_ingreso,
            prestamos,
          });
        }
      } catch (error) {
        console.error('Error al cargar cliente:', error);
      }
    };

    cargarDatos();
  }, []);

  const eliminarCliente = async () => {
    if (!cliente) return;

    if (cliente.prestamos.length > 0) {
      Alert.alert('No permitido', 'Este cliente tiene préstamos registrados');
      return;
    }

    Alert.alert(
      '¿Eliminar cliente?',
      'Esta acción eliminará también sus préstamos y pagos (si existieran)',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync(`DELETE FROM pagos WHERE prestamo_id IN (SELECT id FROM prestamos WHERE cliente_id = ?)`, [cliente.id]);
              await db.runAsync(`DELETE FROM prestamos WHERE cliente_id = ?`, [cliente.id]);
              await db.runAsync(`DELETE FROM clientes WHERE id = ?`, [cliente.id]);

              Alert.alert('Eliminado', 'Cliente y datos asociados eliminados');
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar cliente:', error);
              Alert.alert('Error', 'No se pudo eliminar el cliente');
            }
          },
        },
      ]
    );
  };

  const getEstadoColor = (estado: Prestamo['estado']) => {
    switch (estado) {
      case 'Activo':
        return '#50C878';
      case 'Pagado':
        return '#ccc';
      case 'Vencido':
        return '#FF6347';
      default:
        return '#999';
    }
  };

  if (!cliente) return null;

  const prestamosActivos = cliente.prestamos.filter(p => p.estado === 'Activo').length;
  const saldoTotal = cliente.prestamos.reduce((acc, p) => acc + p.saldo, 0);
  const totalPagado = cliente.prestamos.reduce((acc, p) => acc + p.total_pagado, 0);
const formatearFecha = (iso: string) => {
  const fecha = new Date(iso);
  return `${fecha.getDate().toString().padStart(2, '0')}/${
    (fecha.getMonth() + 1).toString().padStart(2, '0')
  }/${fecha.getFullYear()}`;
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.clientName}>{cliente.nombre}</Text>
            <Text style={styles.subText}>
  Cliente desde: {formatearFecha(cliente.fechaIngreso)}
</Text>

          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Préstamos Activos</Text>
            <Text style={styles.summaryValue}>{prestamosActivos}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Saldo Total</Text>
            <Text style={styles.summaryValue}>${saldoTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Pagado</Text>
            <Text style={styles.summaryValue}>${totalPagado.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📞 Teléfono</Text>
          <Text style={styles.infoText}>{cliente.telefono}</Text>
        </View>

        {cliente.direccion && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Dirección</Text>
            <Text style={styles.infoText}>{cliente.direccion}</Text>
          </View>
        )}

        {cliente.nota && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📝 Nota</Text>
            <Text style={styles.infoText}>{cliente.nota}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Préstamos</Text>
{cliente.prestamos.length === 0 ? (
  <Text style={{ color: '#555', fontSize: 14, marginBottom: 12 }}>
    Este cliente aún no tiene préstamos registrados.
  </Text>
) : (
  cliente.prestamos.map((p) => (
    <View key={p.id} style={styles.loanCard}>
          <View style={styles.loanHeader}>
            <Text style={styles.loanTitle}>Préstamo #{p.id}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(p.estado) }]}>
              <Text style={styles.estadoText}>{p.estado}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('LoanDetailScreen', { prestamoId: p.id })}
          >
            <Text style={{ color: '#2196F3', marginTop: 8 }}>Ver Detalle</Text>
          </TouchableOpacity>
          <Text style={styles.loanDetail}>Monto Original: ${p.monto}</Text>
          <Text style={styles.loanDetail}>Saldo Actual: ${p.saldo}</Text>
          <Text style={styles.loanDetail}>Pagado: ${p.total_pagado}</Text>
          <Text style={styles.loanDetail}>Interés: {p.interes}%</Text>
          <Text style={styles.loanDetail}>Frecuencia: {p.frecuencia}</Text>
          <Text style={styles.loanDetail}>Cuotas: {p.cantidad_cuotas}</Text>
          <Text style={styles.loanDetail}>Inicio: {p.fecha_inicio}</Text>
          <Text style={styles.loanDetail}>Vencimiento: {p.fecha_vencimiento}</Text>
        </View>
      ))
)}


      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: '#FF6347' }]}
        onPress={eliminarCliente}
      >
        <Text style={styles.editText}>Eliminar Cliente</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4F1',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryBox: {
    width: '48%',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
    marginTop: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: 8,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: '#ccc',
},
infoLabel: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#003366',
},
infoText: {
  fontSize: 14,
  color: '#333',
  maxWidth: '60%',
  textAlign: 'right',
},

loanCard: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#ccc',
},
loanHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
loanTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#003366',
},
estadoBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
},
estadoText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 12,
},
loanDetail: {
  fontSize: 14,
  color: '#333',
  marginBottom: 4,
},
});


