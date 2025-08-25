export type RootStackParamList = {
  MainTabs: undefined;
  CreateClient: undefined;
  CreateLoan: { clientId: string }; // si pasas el cliente al crear préstamo
  ClientDetails: { clientId: string };
  LoanDetail: { prestamoId: string }; 
  RegisterPayment: { prestamoId: string };
};
