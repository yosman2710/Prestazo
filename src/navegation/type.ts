export type RootStackParamList = {
  MainTabs: undefined;
  CreateClient: undefined;
  CreateLoan: undefined; // si pasas el cliente al crear préstamo
  ClientDetails: { clientId: string };
  LoanDetailScreen: { prestamoId: string }; 
  RegisterPayment: { prestamoId: string };
};
