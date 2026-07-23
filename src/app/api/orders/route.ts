import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { Order, OrderItem } from '@/types';

// Helper: Memetakan baris database Supabase ke interface Order frontend
function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    code: row.code,
    table: Number(row.table_id), // table_id di db -> table di frontend
    items: row.items as OrderItem[],
    status: row.status as Order['status'],
    total: row.total,
    createdAt: row.created_at, // created_at di db -> createdAt di frontend
    date: row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : '',
  };
}

// GET: Mengambil semua pesanan dari Supabase
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('id', { ascending: false }); // Urutan ID descending agar pesanan terbaru di atas

    if (error) throw error;

    const mappedOrders = (data || []).map(mapOrderRow);
    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memuat pesanan' }, { status: 500 });
  }
}

// POST: Membuat pesanan baru di Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table, items } = body as { table: number; items: OrderItem[] };

    if (!table || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Nomor meja dan item pesanan harus diisi' }, { status: 400 });
    }

    // Ambil order terakhir untuk generate order code (A01, A02, dst)
    const { data: latestOrders, error: latestError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (latestError) throw latestError;
    
    const nextId = (latestOrders && latestOrders[0] ? latestOrders[0].id : 0) + 1;
    const code = `A${String(nextId).padStart(2, '0')}`;

    // Hitung total harga
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          code,
          table_id: table, // Simpan ke table_id
          items,
          status: 'masuk',
          total,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapOrderRow(data), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal membuat pesanan' }, { status: 500 });
  }
}

// PATCH: Memperbarui status pesanan di Supabase (masuk -> diproses -> selesai)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body as { id: number; status: Order['status'] };

    if (!id || !status) {
      return NextResponse.json({ error: 'ID pesanan dan status harus diisi' }, { status: 400 });
    }

    const validStatuses: Order['status'][] = ['masuk', 'diproses', 'selesai'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status pesanan tidak valid' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(mapOrderRow(data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memperbarui status pesanan' }, { status: 500 });
  }
}
