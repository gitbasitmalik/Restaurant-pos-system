import api from './api';
import { ApiResponse, Order, Orderstats, Table } from '../types';

export const orderservice = {
  // Orders
  getOrders: async (params?: {
    status?: string;
    orderType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<Order[]>>('/orders', { params });
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: Partial<Order>) => {
    const response = await api.post<ApiResponse<Order>>('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id: string, orderData: Partial<Order>) => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}`, orderData);
    return response.data;
  },

  updateOrderstatus: async (id: string, status: string) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return response.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: string, paymentMethod?: string) => {
    const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/payment`, { 
      paymentStatus, 
      paymentMethod 
    });
    return response.data;
  },

  getTodayOrders: async () => {
    const response = await api.get<ApiResponse<Order[]>>('/orders/today');
    return response.data;
  },

  getOrderstats: async () => {
    const response = await api.get<ApiResponse<Orderstats>>('/orders/stats');
    return response.data;
  },

  // Tables
  getTables: async () => {
    const response = await api.get<ApiResponse<Table[]>>('/tables');
    return response.data;
  },

  getAvailableTables: async () => {
    const response = await api.get<ApiResponse<Table[]>>('/tables/available');
    return response.data;
  },

  createTable: async (tableData: Partial<Table>) => {
    const response = await api.post<ApiResponse<Table>>('/tables', tableData);
    return response.data;
  },

  updateTable: async (id: string, tableData: Partial<Table>) => {
    const response = await api.put<ApiResponse<Table>>(`/tables/${id}`, tableData);
    return response.data;
  },

  updateTableStatus: async (id: string, status: string) => {
    const response = await api.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status });
    return response.data;
  },

  deleteTable: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/tables/${id}`);
    return response.data;
  },
};
