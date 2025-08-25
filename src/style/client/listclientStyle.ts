import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  emptyText: {
  textAlign: 'center',
  fontSize: 16,
  color: '#999',
  marginTop: 40,
  fontStyle: 'italic',
},

});
export default styles;