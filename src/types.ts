// CLIENTES

export type Cliente = {
  id: string;
  fechaIngreso: string;
  nombre: string;
  telefono: string;
  direccion: string;
  nota?: string;
  prestamos: Prestamo[]; // ← se llena al consultar detalles
};

export type ClienteConPrestamos = {
  id: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  nota?: string;
  fechaIngreso: string;
  loans: number;     // cantidad de préstamos
  debt: number;      // suma de saldos
  paid: number;      // suma de pagos
};

export type NuevoCliente = {
  nombre: string;
  telefono: string;
  direccion: string;
  nota?: string;
  fechaIngreso: string;
};

export type ClienteEditable = Omit<Cliente, 'id' | 'prestamos'>;


// PRÉSTAMOS

export type PrestamoEstado = 'Activo' | 'Pagado' | 'Vencido';

export type PrestamoFrecuencia = 'Diario' | 'Semanal' | 'Mensual';

export type Prestamo = {
  id: string;
  cliente_id: string;
  monto: number;
  saldo: number;
  total_pagado: number;
  interes: number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  frecuencia: PrestamoFrecuencia;
  cantidad_cuotas: number;
  estado: PrestamoEstado;
};

export type PrestamoInput = {
  cliente_id: string;
  monto: number;
  interes: number;
  fecha_inicio: string;
  frecuencia: PrestamoFrecuencia;
  cantidad_cuotas: number;
};


// PAGOS

export type Pago = {
  id: string;
  prestamo_id: string;
  fecha: string;
  monto: number;
  nota?: string;
};

export type PagoInput = {
  prestamo_id: string;
  fecha: string;
  monto: number;
  nota?: string;
};


// DASHBOARD / RESUMEN

export type ClienteResumen = {
  totalClientes: number;
  conPrestamos: number;
  prestamosActivos: number;
  saldoTotal: number;
  totalPagado: number;
};
