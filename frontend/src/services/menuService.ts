import api from './api';
import { ApiResponse, Category, MenuItem } from '../types';

export const menuService = {
  // Categories
  getCategories: async () => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  },

  createCategory: async (categoryData: Partial<Category>) => {
    const response = await api.post<ApiResponse<Category>>('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
    return response.data;
  },

  // Menu Items
  getMenuItems: async (params?: {
    category?: string;
    isVeg?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<MenuItem[]>>('/menu-items', { params });
    return response.data;
  },

  getMenuItem: async (id: string) => {
    const response = await api.get<ApiResponse<MenuItem>>(`/menu-items/${id}`);
    return response.data;
  },

  createMenuItem: async (itemData: Partial<MenuItem>) => {
    const response = await api.post<ApiResponse<MenuItem>>('/menu-items', itemData);
    return response.data;
  },

  updateMenuItem: async (id: string, itemData: Partial<MenuItem>) => {
    const response = await api.put<ApiResponse<MenuItem>>(`/menu-items/${id}`, itemData);
    return response.data;
  },

  deleteMenuItem: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/menu-items/${id}`);
    return response.data;
  },

  getMenuItemsByCategory: async (categoryId: string) => {
    const response = await api.get<ApiResponse<MenuItem[]>>(`/menu-items/category/${categoryId}`);
    return response.data;
  },
};
