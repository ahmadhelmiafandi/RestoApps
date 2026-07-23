import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { RestoTable } from '@/types';

// GET: Mengambil semua meja dari Supabase
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tables')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memuat meja' }, { status: 500 });
  }
}

// POST: Menambah meja baru di Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body as { name: string };

    if (!name) {
      return NextResponse.json({ error: 'Nama meja harus diisi' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('tables')
      .insert([
        {
          name,
          status: 'kosong',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan meja' }, { status: 500 });
  }
}

// PUT: Mengubah meja di Supabase (Nama / Status)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, status } = body as { id: number; name?: string; status?: RestoTable['status'] };

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'ID meja tidak valid' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('tables')
      .update({
        name,
        status,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengubah meja' }, { status: 500 });
  }
}

// DELETE: Menghapus meja dari Supabase
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body as { id: number };

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'ID meja tidak valid' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('tables')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Meja berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menghapus meja' }, { status: 500 });
  }
}
