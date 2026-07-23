import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Printer, QrCode } from 'lucide-react';
import { COLOR } from '@/lib/constants';
import { RestoTable } from '@/types';
import GlassCard from '../ui/GlassCard';
import FakeQR from '../ui/FakeQR';

interface TableCRUDProps {
  tables: RestoTable[];
  addTable: (name: string) => Promise<boolean>;
  updateTable: (id: number, data: Partial<RestoTable>) => Promise<boolean>;
  deleteTable: (id: number) => Promise<boolean>;
}

export default function TableCRUD({
  tables,
  addTable,
  updateTable,
  deleteTable,
}: TableCRUDProps) {
  const [newTableName, setNewTableName] = useState('');
  const [editingTableId, setEditingTableId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [activeQrTable, setActiveQrTable] = useState<RestoTable | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    setSubmitting(true);
    const success = await addTable(newTableName.trim());
    if (success) {
      setNewTableName('');
    }
    setSubmitting(false);
  };

  const handleStartEdit = (table: RestoTable) => {
    setEditingTableId(table.id);
    setEditingName(table.name);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) return;
    await updateTable(id, { name: editingName.trim() });
    setEditingTableId(null);
  };

  const handleToggleStatus = async (table: RestoTable) => {
    const nextStatus = table.status === 'kosong' ? 'terisi' : 'kosong';
    await updateTable(table.id, { status: nextStatus });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus meja ini? Semua QR code untuk meja ini tidak akan berfungsi.')) {
      await deleteTable(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-white">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Kelola Meja & QR Code</h2>
          <p className="text-xs" style={{ color: COLOR.muted }}>
            Tambah meja, unduh QR Code, dan atur status ketersediaan meja
          </p>
        </div>

        {/* Form Tambah Meja */}
        <form onSubmit={handleAddTable} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Nama Meja Baru (misal: Meja 13)"
            className="glass-input px-4 py-2.5 rounded-xl text-xs w-full sm:w-56 font-semibold"
            disabled={submitting}
            required
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-slate-900 transition hover:brightness-110 active:scale-95 shrink-0"
            style={{ background: COLOR.matcha }}
            disabled={submitting}
          >
            <Plus size={15} /> Tambah Meja
          </button>
        </form>
      </div>

      {/* Grid Meja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const isEditing = editingTableId === table.id;
          const qrLink = `/customer?table=${table.id}`; // Relative URL for scanning
          
          return (
            <GlassCard
              key={table.id}
              className={`p-4 border flex flex-col justify-between transition-all duration-300 ${
                table.status === 'terisi' ? 'border-orange-500/20' : 'border-white/10'
              }`}
            >
              <div>
                {/* Header Meja */}
                <div className="flex justify-between items-start mb-3">
                  {isEditing ? (
                    <div className="flex gap-1 items-center w-full pr-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="glass-input px-2 py-1 rounded-lg text-xs w-full font-bold"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(table.id)}
                        className="text-emerald-400 p-1 hover:bg-white/5 rounded"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTableId(null)}
                        className="text-red-400 p-1 hover:bg-white/5 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{table.name}</h3>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(table)}
                        className="text-white/45 hover:text-white transition"
                        aria-label="Edit name"
                      >
                        <Edit2 size={11} />
                      </button>
                    </div>
                  )}
                  
                  {/* Status Toggle Badge */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(table)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full transition"
                    style={{
                      background: table.status === 'terisi' ? `${COLOR.chili}22` : `${COLOR.selesai}22`,
                      color: table.status === 'terisi' ? COLOR.chili : COLOR.selesai,
                      border: `1px solid ${table.status === 'terisi' ? COLOR.chili : COLOR.selesai}33`
                    }}
                  >
                    {table.status === 'terisi' ? 'Terisi' : 'Kosong'}
                  </button>
                </div>

                {/* QR Code Preview Thumbnail */}
                <div
                  className="my-3 flex items-center justify-center p-3 rounded-2xl cursor-pointer hover:bg-white/5 border border-white/5 transition"
                  onClick={() => setActiveQrTable(table)}
                  title="Klik untuk memperbesar QR Code"
                >
                  <FakeQR seed={qrLink} size={90} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveQrTable(table)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-900 px-3 py-1.5 rounded-lg transition"
                  style={{ background: COLOR.turmeric }}
                >
                  <QrCode size={12} /> QR Code
                </button>
                
                <button
                  type="button"
                  onClick={() => handleDelete(table.id)}
                  className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  aria-label="Delete table"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Modal QR Code Detail */}
      {activeQrTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <GlassCard className="p-6 w-full max-w-sm border border-white/15 bg-[#1E1630] text-center flex flex-col items-center gap-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between w-full">
              <h3 className="font-display text-lg font-bold text-white">QR Code {activeQrTable.name}</h3>
              <button
                type="button"
                onClick={() => setActiveQrTable(null)}
                className="text-white/60 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main QR Code visual */}
            <div className="bg-white p-6 rounded-3xl shadow-xl flex items-center justify-center border border-white/10">
              <FakeQR seed={`/customer?table=${activeQrTable.id}`} size={180} />
            </div>

            <div className="text-left w-full text-xs flex flex-col gap-2">
              <p className="font-semibold text-white/90">Panduan Penggunaan:</p>
              <ol className="list-decimal pl-4 flex flex-col gap-1 text-[11px]" style={{ color: COLOR.muted }}>
                <li>Cetak QR Code di atas.</li>
                <li>Tempelkan di {activeQrTable.name}.</li>
                <li>Pelanggan dapat memindai QR Code untuk membuka menu digital dan memesan secara otomatis di meja tersebut.</li>
              </ol>
            </div>

            {/* Print Action */}
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 text-slate-900 transition hover:brightness-110 active:scale-95"
              style={{ background: COLOR.turmeric }}
            >
              <Printer size={14} /> Cetak / Print QR Code Meja
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

