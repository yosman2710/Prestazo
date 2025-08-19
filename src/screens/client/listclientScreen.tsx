import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navegation/type';
const mockClients = [
  {
    id: '1',
    name: 'María González',
    phone: '+58 412-1234567',
    address: 'Av. Libertador 123',
    loans: 2,
    debt: 8200,
    paid: 15600,
  },
  {
    id: '2',
    name: 'Carlos Pérez',
    phone: '+58 414-9876543',
    address: 'Calle 5, Maracaibo',
    loans: 1,
    debt: 0,
    paid: 3000,
  },
  {
    id: '3',
    name: 'Ana Torres',
    phone: '+58 424-5556677',
    address: 'Sector El Sol',
    loans: 3,
    debt: 4500,
    paid: 9000,
  },
  {
    id: '4',
    name: 'Luis Mendoza',
    phone: '+58 416-1122334',
    address: 'Callejón 8, Zulia',
    loans: 0,
    debt: 0,
    paid: 0,
  },
];

export default function ClientListScreen() {
  const [search, setSearch] = useState('');

  const filteredClients = mockClients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalClients = mockClients.length;
  const withLoans = mockClients.filter((c) => c.loans > 0).length;
  const activeLoans = mockClients.reduce((acc, c) => acc + c.loans, 0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Clientes</Text>
      <Text style={styles.subtitle}>{filteredClients.length} clientes registrados</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar cliente..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Tarjetas resumen */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Total Clientes" value={totalClients} color="#2196F3" />
        <SummaryCard label="Con Préstamos" value={withLoans} color="#4CAF50" />
        <SummaryCard label="Préstamos Activos" value={activeLoans} color="#FF9800" />
      </View>

      {/* Lista de clientes */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClientCard client={item} />}
      />

      <TouchableOpacity style={styles.newButton}
      onPress={() => navigation.navigate('CreateClient')}>
        <Text style={styles.newButtonText}>+ Nuevo</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

type SummaryCardProps = {
  label: string;
  value: number | string;
  color: string;
};

const SummaryCard = ({ label, value, color }: SummaryCardProps) => (
  <View style={[styles.summaryCard, { borderLeftColor: color }]}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);


type Client = {
  id: string;
  name: string;
  phone: string;
  address: string;
  loans: number;
  debt: number;
  paid: number;
};

type ClientCardProps = {
  client: Client;
};

const ClientCard = ({ client }: ClientCardProps) => (
  <View style={styles.clientCard}>
    <Text style={styles.clientName}>{client.name}</Text>
    <Text style={styles.clientInfo}>📞 {client.phone}</Text>
    <Text style={styles.clientInfo}>📍 {client.address}</Text>
    <Text style={styles.clientInfo}>💳 Préstamos: {client.loans}</Text>

    <View style={styles.financialRow}>
      <Text style={styles.debt}>Debe: ${client.debt}</Text>
      <Text style={styles.paid}>Pagado: ${client.paid}</Text>
    </View>

    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.detailButton}>
        <Text style={styles.detailButtonText}>Ver Detalle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loanButton}>
        <Text style={styles.loanButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </View>
);


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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderLeftWidth: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  clientCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 4,
  },
  clientInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  debt: {
    color: '#FF5722',
    fontWeight: 'bold',
  },
  paid: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailButton: {
    backgroundColor: '#FFEB3B',
    padding: 6,
    borderRadius: 6,
  },
  detailButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  loanButton: {
    backgroundColor: '#ee0505ff',
    padding: 6,
    borderRadius: 6,
  },
  loanButtonText: {
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
