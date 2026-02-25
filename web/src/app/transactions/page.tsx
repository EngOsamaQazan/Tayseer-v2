'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Transaction {
  id: number;
  type: string;
  status: string;
  amount: number;
  date: string;
  description: string | null;
  contractId: number | null;
  paymentMethod: string | null;
  receiptNumber: string | null;
  notes: string | null;
  category?: { id: number; name: string } | null;
  company?: { id: number; name: string } | null;
}

interface TransactionsResponse {
  data: Transaction[];
  total: number;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    incomeCount: number;
    expenseCount: number;
  };
}

const typeLabels: Record<string, string> = { income: 'دخل', expense: 'مصاريف', transfer: 'تحويل', bank_import: 'استيراد بنكي' };
const typeColors: Record<string, string> = { income: 'bg-emerald-100 text-emerald-700', expense: 'bg-red-100 text-red-700', transfer: 'bg-blue-100 text-blue-700', bank_import: 'bg-purple-100 text-purple-700' };
const statusLabels: Record<string, string> = { confirmed: 'مؤكد', pending: 'معلق', reversed: 'ملغي' };
const statusColors: Record<string, string> = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', reversed: 'bg-red-100 text-red-700' };

const inputClass = 'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<TransactionsResponse['summary'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [filters, setFilters] = useState({ type: '', dateFrom: '', dateTo: '', status: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filters.type) params.set('type', filters.type);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      if (filters.status) params.set('status', filters.status);

      const res = await api.get<TransactionsResponse>(`/financial-transactions?${params}`);
      setTransactions(res.data); setTotal(res.total); setSummary(res.summary);
    } catch (err) { setError(err instanceof Error ? err.message : 'خطأ'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الحركات المالية</h1>
          <p className="text-gray-500 text-sm">إجمالي: {total} حركة</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">+ إضافة حركة</button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-sm text-gray-600">إجمالي الدخل</p>
            <p className="text-2xl font-bold text-emerald-700">{summary.totalIncome.toLocaleString('ar-SA')} د.أ</p>
            <p className="text-xs text-gray-500">{summary.incomeCount} حركة</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-sm text-gray-600">إجمالي المصاريف</p>
            <p className="text-2xl font-bold text-red-700">{summary.totalExpense.toLocaleString('ar-SA')} د.أ</p>
            <p className="text-xs text-gray-500">{summary.expenseCount} حركة</p>
          </div>
          <div className={`border rounded-xl p-5 ${summary.netBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-sm text-gray-600">صافي الرصيد</p>
            <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>{summary.netBalance.toLocaleString('ar-SA')} د.أ</p>
          </div>
        </div>
      )}

      {showAdd && <AddTransactionForm onSuccess={() => { setShowAdd(false); fetchData(); }} onCancel={() => setShowAdd(false)} />}

      <div className="bg-white rounded-xl border">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b">
          <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">كل الأنواع</option>
            <option value="income">دخل</option>
            <option value="expense">مصاريف</option>
            <option value="transfer">تحويل</option>
            <option value="bank_import">استيراد بنكي</option>
          </select>
          <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">كل الحالات</option>
            <option value="confirmed">مؤكد</option>
            <option value="pending">معلق</option>
            <option value="reversed">ملغي</option>
          </select>
          <input type="date" value={filters.dateFrom} onChange={(e) => { setFilters({ ...filters, dateFrom: e.target.value }); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm" placeholder="من" />
          <input type="date" value={filters.dateTo} onChange={(e) => { setFilters({ ...filters, dateTo: e.target.value }); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm" placeholder="إلى" />
          {(filters.type || filters.dateFrom || filters.dateTo || filters.status) && (
            <button onClick={() => { setFilters({ type: '', dateFrom: '', dateTo: '', status: '' }); setPage(1); }} className="text-red-500 text-sm hover:text-red-700">مسح الفلاتر</button>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-700 p-4 text-sm">{error}</div>}

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">جاري التحميل...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">لا توجد حركات مالية</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-start font-medium">النوع</th>
                <th className="px-4 py-3 text-start font-medium">المبلغ</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th className="px-4 py-3 text-start font-medium">الفئة</th>
                <th className="px-4 py-3 text-start font-medium">طريقة الدفع</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">الوصف</th>
              </tr></thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[tx.type] || ''}`}>{typeLabels[tx.type] || tx.type}</span></td>
                    <td className="px-4 py-3 font-medium">{Number(tx.amount).toLocaleString('ar-SA')} د.أ</td>
                    <td className="px-4 py-3 text-gray-600">{tx.date}</td>
                    <td className="px-4 py-3 text-gray-600">{tx.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{tx.paymentMethod || '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${statusColors[tx.status] || ''}`}>{statusLabels[tx.status] || tx.status}</span></td>
                    <td className="px-4 py-3 text-gray-600 max-w-48 truncate">{tx.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-500">صفحة {page} من {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-40">السابق</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-40">التالي</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddTransactionForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ type: 'income', amount: '', date: '', description: '', paymentMethod: '', receiptNumber: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await api.post('/financial-transactions', { ...form, amount: Number(form.amount) });
      onSuccess();
    } catch (err) { setError(err instanceof Error ? err.message : 'خطأ'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">إضافة حركة مالية</h2>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">النوع *</label>
          <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
            <option value="income">دخل</option><option value="expense">مصاريف</option><option value="transfer">تحويل</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label><input required type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label><input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label><input value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className={inputClass} placeholder="نقدي / شيك / تحويل" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم الإيصال</label><input value={form.receiptNumber} onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })} className={inputClass} /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} /></div>
        <div className="flex items-end gap-2">
          <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'جاري الحفظ...' : 'حفظ'}</button>
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-300">إلغاء</button>
        </div>
      </form>
    </div>
  );
}
