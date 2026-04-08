export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'manager' | 'customer';
  status: 'active' | 'blocked';
  created_at?: Date;
  updated_at?: Date;
}

export interface Category {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_id?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_id?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  type: 'simple' | 'variable' | 'digital';
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock';
  manage_stock: boolean;
  category_id?: string;
  brand_id?: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_method?: string;
  created_at?: Date;
}
