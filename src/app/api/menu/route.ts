import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { MenuItem } from '@/types';

export const dynamic = 'force-dynamic';


// GET: Mengambil semua menu dari Supabase
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memuat menu' }, { status: 500 });
  }
}

// POST: Menambah menu baru di Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, price, desc, emoji, available, popular } = body;

    // Validasi sederhana
    if (!name || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Nama dan harga (angka positif) harus diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('menu')
      .insert([
        {
          name,
          category: category || 'Lainnya',
          price,
          desc: desc || '',
          emoji: emoji || '🍛',
          available: available !== undefined ? available : true,
          popular: popular !== undefined ? popular : false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan menu' }, { status: 500 });
  }
}

// PUT: Mengubah menu di Supabase
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, price, desc, emoji, available, popular } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'ID menu tidak valid' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('menu')
      .update({
        name,
        category,
        price,
        desc,
        emoji,
        available,
        popular,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengubah menu' }, { status: 500 });
  }
}

// DELETE: Menghapus menu dari Supabase
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'ID menu tidak valid' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('menu')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Menu berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menghapus menu' }, { status: 500 });
  }
}
