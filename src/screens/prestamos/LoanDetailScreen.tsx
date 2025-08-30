import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { RootStackParamList } from '../../navegation/type';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoanDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'LoanDetailScreen'>>();
  const db = useSQLiteContext();
  const { prestamoId } = route.params;

  const [prestamo, setPrestamo] = useState<any>(null);
  const [pagos, setPagos] = useState<{ fecha: string; monto: number }[]>([]);
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [añoActual, setAñoActual] = useState(new Date().getFullYear());

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const p = await db.getFirstAsync(
          `SELECT p.*, c.nombre AS cliente FROM prestamos p JOIN clientes c ON c.id = p.cliente_id WHERE p.id = ?`,
          [prestamoId]
        );
        setPrestamo(p);

        const pagosRealizados = await db.getAllAsync(
  `SELECT fecha, monto FROM pagos WHERE prestamo_id = ? ORDER BY fecha ASC`,
  [prestamoId]
) as { fecha: string; monto: number }[];

        setPagos(pagosRealizados);
      } catch (error) {
        console.error('Error al cargar préstamo:', error);
      }
    };

    cargarDatos();
  }, []);

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
    const diasPorCuota = {
      Diario: 1,
      Semanal: 7,
      Quincenal: 15,
      Mensual: 30,
    };
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
    return `${fecha.getDate().toString().padStart(2, '0')}/${
      (fecha.getMonth() + 1).toString().padStart(2, '0')
    }/${fecha.getFullYear()}`;
  };

  if (!prestamo) return null;
  const montoTotal = prestamo.monto + (prestamo.monto * prestamo.interes) / 100;
const saldoPendiente = montoTotal - prestamo.total_pagado;


  const pagosEsperados = generarFechasEsperadas(
    prestamo.fecha_inicio,
    prestamo.frecuencia,
    prestamo.cantidad_cuotas
  );

  const pagosRealizadosFechas = pagos.map((p) => p.fecha.slice(0, 10));
  const progreso = Math.round((pagos.length / prestamo.cantidad_cuotas) * 100);
  const diasDelMes = obtenerDiasDelMes(mesActual, añoActual);
  const nombreMes = new Date(añoActual, mesActual - 1).toLocaleString('es-VE', {
    month: 'long',
  });
  const eliminarPrestamo = async () => {
  Alert.alert(
    '¿Eliminar préstamo?',
    'Esta acción no se puede deshacer. ¿Estás seguro?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await db.runAsync(`DELETE FROM pagos WHERE prestamo_id = ?`, [prestamoId]);
            await db.runAsync(`DELETE FROM prestamos WHERE id = ?`, [prestamoId]);
            Alert.alert('Préstamo eliminado');
            navigation.goBack();
          } catch (error) {
            console.error('Error al eliminar préstamo:', error);
            Alert.alert('Error', 'No se pudo eliminar el préstamo');
          }
        },
      },
    ]
  );
};


  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalle del Préstamo</Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.clientName}>{prestamo.cliente}</Text>
            <Text style={styles.subText}>ID: {prestamo.cliente_id}</Text>
          </View>
          <View style={styles.estadoBadge}>
            <Text style={styles.estadoText}>{prestamo.estado}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Monto Original</Text>
            <Text style={styles.summaryValue}>${prestamo.monto}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Saldo Pendiente</Text>
              <Text style={styles.summaryValue}>${saldoPendiente.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total a Pagar</Text>
            <Text style={styles.summaryValue}>${montoTotal.toFixed(2)}</Text>

            <Text style={styles.subText}>{prestamo.interes}% interés</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Progreso</Text>
            <Text style={styles.summaryValue}>{progreso}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Detalles del Préstamo</Text>
        <Text style={styles.detailText}>Tasa de Interés: {prestamo.interes}%</Text>
        <Text style={styles.detailText}>
          Fecha de Inicio: {formatearFecha(prestamo.fecha_inicio)}
        </Text>
        <Text style={styles.detailText}>
          Fecha de Vencimiento: {formatearFecha(prestamo.fecha_vencimiento)}
        </Text>
        <Text style={styles.detailText}>
          Frecuencia de Pago: {prestamo.frecuencia}
        </Text>

        <Text style={styles.sectionTitle}>Notas:</Text>
        <Text style={styles.detailText}>
          Cliente confiable con historial de pagos puntuales.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Calendario de Pagos</Text>

      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={retrocederMes}>
          <Text style={styles.navButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} {añoActual}
        </Text>
        <TouchableOpacity onPress={avanzarMes}>
          <Text style={styles.navButton}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarGrid}>
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((dia, i) => (
          <Text key={i} style={styles.dayHeader}>{dia}</Text>
        ))}

      {diasDelMes.map(({ fecha, dia }, index) => {
  let color = '#6d6d6dff'; // gris claro por defecto

if (pagosRealizadosFechas.includes(fecha)) {
  color = '#50C878'; // verde si se pagó ese día
} else if (pagosEsperados.includes(fecha)) {
  const vencido = new Date(fecha) < new Date();
  color = vencido ? '#FF6347' : '#FFD700'; // rojo si vencido, amarillo si aún no ha vencido
}


  return (
    <View key={index} style={[styles.dayBoxGrid, { backgroundColor: color }]}>
      <Text style={styles.dayText}>{dia !== 0 ? dia : ''}</Text>
    </View>
  );
})}

      </View>

            <Text style={styles.sectionTitle}>Historial de Pagos</Text>
      {pagos.length === 0 ? (
        <Text style={{ color: '#555', fontSize: 14, marginBottom: 12 }}>
          No se han registrado pagos aún.
        </Text>
      ) : (
        pagos.map((pago, index) => (
          <View key={index} style={styles.paymentItem}>
            <Text style={styles.paymentText}>
              {formatearFecha(pago.fecha)} — ${pago.monto}
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={eliminarPrestamo}>
  <Text style={styles.deleteButtonText}>🗑️ Eliminar Préstamo</Text>
</TouchableOpacity>

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
  flex: 1,
  backgroundColor: '#E6F4F1', // o el color que uses de fondo
},

  container: {
    backgroundColor: '#E6F4F1',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 12,
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
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A90E2',
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
  estadoBadge: {
    backgroundColor: '#50C878',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  summaryBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  navButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
    paddingHorizontal: 12,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
 calendarGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  width: 280, // 40px × 7 días
  alignSelf: 'center',
  marginBottom: 20,
},

dayHeader: {
  width: 40,
  textAlign: 'center',
  fontWeight: 'bold',
  color: '#003366',
  marginBottom: 4,
},

 dayBoxGrid: {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 6,
  marginBottom: 4,
},

  dayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paymentItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  paymentText: {
    color: '#333',
    fontSize: 14,
  },

  deleteButton: {
  backgroundColor: '#F44336',
  paddingVertical: 12,
  borderRadius: 8,
marginTop: 30, // antes era 20
  marginBottom: 30, 
  alignItems: 'center',
},
deleteButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

});

