export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'waiter';
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: Category;
  image?: string;
  ingredients?: string[];
  isVeg: boolean;
  isAvailable: boolean;
  preparationTime: number;
  rating: number;
  createdAt: string;
}

export interface Table {
  _id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location: 'indoor' | 'outdoor' | 'private';
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  _id?: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  table?: Table;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'upi' | 'online';
  waiter?: User;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface Orderstats {
  todayOrdeRs: number;
  todayRevenue: number;
  pendingOrdeRs: number;
  preparingOrdeRs: number;
}
