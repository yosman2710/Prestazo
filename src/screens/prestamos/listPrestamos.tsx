// LoanListScreen.tsx
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

const mockLoans = [
  {
    id: '1',
    client: 'María González',
    amount: 5000,
    balance: 3200,
    dueDate: '2024-03-01',
    interest: 15,
    status: 'Activo',
  },
  {
    id: '2',
    client: 'Carlos Pérez',
    amount: 3000,
    balance: 0,
    dueDate: '2024-01-15',
    interest: 12,
    status: 'Pagado',
  },
  {
    id: '3',
    client: 'Ana Torres',
    amount: 4500,
    balance: 4500,
    dueDate: '2024-05-10',
    interest: 18,
    status: 'Vencido',
  },
  {
    id: '4',
    client: 'Luis Mendoza',
    amount: 2000,
    balance: 1500,
    dueDate: '2024-04-20',
    interest: 10,
    status: 'Activo',
  },
];

const filters = ['Todos', 'Activos', 'Vencidos', 'Pagados'];

export default function LoanListScreen() {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const filteredLoans = mockLoans.filter((loan) => {
    const matchSearch = loan.client.toLowerCase().includes(search.toLowerCase());
    const matchFilter = selectedFilter === 'Todos' || loan.status === selectedFilter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Préstamos</Text>
      <Text style={styles.subtitle}>{filteredLoans.length} préstamos encontrados</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por cliente..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map((filter) => (
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
            <Text style={styles.cardText}>Monto Prestado: ${item.amount}</Text>
            <Text style={styles.cardText}>Saldo Actual: ${item.balance}</Text>
            <Text style={styles.cardText}>Fecha Vencimiento: {item.dueDate}</Text>
            <Text style={styles.cardText}>Interés: {item.interest}%</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.detailButton}>
                <Text style={styles.detailButtonText}>Ver Detalle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.payButton}>
                <Text style={styles.payButtonText}>Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.newButton}>
        <Text style={styles.newButtonText}>+ Nuevo</Text>
      </TouchableOpacity>
    </View>
  );
}

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