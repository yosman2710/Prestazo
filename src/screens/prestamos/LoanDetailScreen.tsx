import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const pagosRealizados = ['2024-01-14', '2024-02-14', '2024-03-14'];
const pagosEsperados = [
  '2024-01-14',
  '2024-02-14',
  '2024-03-14',
  '2024-04-14',
  '2024-05-14',
  '2024-06-14',
  '2024-07-14',
];

const historialPagos = [
  { fecha: '14/01/2024', monto: 500 },
  { fecha: '14/02/2024', monto: 500 },
  { fecha: '14/03/2024', monto: 500 },
];

const obtenerDiasDelMes = (mes: number, año: number) => {
  const dias: { fecha: string; dia: number }[] = [];
  const primerDia = new Date(año, mes - 1, 1);
  const ultimoDia = new Date(año, mes, 0);
  const totalDias = ultimoDia.getDate();
  const offset = primerDia.getDay(); // 0 = domingo

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

export default function LoanDetailScreen() {
  const [mesActual, setMesActual] = useState(1); // Enero
  const [añoActual, setAñoActual] = useState(2024);

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

  const diasDelMes = obtenerDiasDelMes(mesActual, añoActual);
  const nombreMes = new Date(añoActual, mesActual - 1).toLocaleString('es-VE', {
    month: 'long',
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalle del Préstamo</Text>

      {/* Resumen */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.clientName}>María Jimenez</Text>
            <Text style={styles.subText}>ID: C001</Text>
          </View>
          <View style={styles.estadoBadge}>
            <Text style={styles.estadoText}>Activo</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Monto Original</Text>
            <Text style={styles.summaryValue}>$5,000</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Saldo Pendiente</Text>
            <Text style={styles.summaryValue}>$2,300</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total a Pagar</Text>
            <Text style={styles.summaryValue}>$5,750</Text>
            <Text style={styles.subText}>15% interés</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Progreso</Text>
            <Text style={styles.summaryValue}>60%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Detalles del Préstamo</Text>
        <Text style={styles.detailText}>Tasa de Interés: 15%</Text>
        <Text style={styles.detailText}>Fecha de Inicio: 14/01/2024</Text>
        <Text style={styles.detailText}>Fecha de Vencimiento: 14/07/2024</Text>
        <Text style={styles.detailText}>Frecuencia de Pago: Mensual</Text>

        <Text style={styles.sectionTitle}>Notas:</Text>
        <Text style={styles.detailText}>
          Cliente confiable con historial de pagos puntuales.
        </Text>
      </View>

      {/* Calendario mensual */}
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

          let color = '#969696ff';
          if (pagosEsperados.includes(fecha)) {
            color = pagosRealizados.includes(fecha)
              ? '#50C878'
              : new Date(fecha) < new Date()
              ? '#FF6347'
              : '#cececeff';
          }

          return (
      <View key={index} style={[styles.dayBoxGrid, { backgroundColor: color }]}>
        <Text style={styles.dayText}>{dia !== 0 ? dia : ''}</Text>
      </View>
    );
  })}
</View>


      {/* Historial de pagos */}
      <Text style={styles.sectionTitle}>Historial de Pagos</Text>
      {historialPagos.map((pago, index) => (
        <View key={index} style={styles.paymentItem}>
          <Text style={styles.paymentText}>
            {pago.fecha} — ${pago.monto}
          </Text>
        </View>
      ))}

      {/* Botón editar */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => console.log('Editar Préstamo')}
      >
        <Text style={styles.editText}>Editar Préstamo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});