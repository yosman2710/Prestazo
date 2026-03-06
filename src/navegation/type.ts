export type RootStackParamList = {
  MainTabs: undefined;
  CreateClient: undefined;
  CreateLoan: { clientId?: string }; // si pasas el cliente al crear préstamo
  ClientDetails: { clientId: string };
  LoanDetailScreen: { prestamoId: string };
  RegisterPayment: { prestamoId: string };
  EditClient: { clientId: string };
  Login: undefined;
  Register: undefined;
};
