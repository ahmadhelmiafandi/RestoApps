import fs from 'fs/promises';
import path from 'path';
import { MenuItem, Order, RestoTable } from '@/types';

const dbPath = path.join(process.cwd(), 'src/data/db.json');

export interface DbData {
  menu: MenuItem[];
  orders: Order[];
  tables: RestoTable[];
}

export async function readDb(): Promise<DbData> {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(fileContent) as DbData;
  } catch (error) {
    console.error('Gagal membaca database:', error);
    // Kembalikan default jika file tidak ditemukan atau korup
    return { menu: [], orders: [], tables: [] };
  }
}

export async function writeDb(data: DbData): Promise<void> {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Gagal menulis ke database:', error);
    throw new Error('Gagal menulis data');
  }
}
