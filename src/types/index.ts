export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  desc: string;
  emoji: string;
  available: boolean;
  popular: boolean;
}

export interface OrderItem extends MenuItem {
  qty: number;
}

export interface Order {
  id: number;
  code: string;
  table: number;
  items: OrderItem[];
  status: 'masuk' | 'diproses' | 'selesai';
  total: number;
  createdAt: string;
  date: string;
}

export interface RestoTable {
  id: number;
  name: string;
  status: 'kosong' | 'terisi';
}
