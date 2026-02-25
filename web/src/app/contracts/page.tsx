'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Contract {
  id: number;
  contractNumber: string;
  status: string;
  contractDate: string;
  totalAmount: number;
  financedAmount: number;
  downPayment: number;
  installmentCount: number;
  installmentAmount: number;
  profitRate: number;
  firstInstallmentDate: string;
  description: string | null;
  notes: string | null;
  customer?: { id: number; name: string };
  company?: { id: number; name: string } | null;
  installments?: Installment[];
}

interface Installment {
  id: number;
  installmentNumber: number;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
}

const statusLabels: Record<string, string> = {
  draft: 'مسودة', active: 'نشط', completed: 'مكتمل', defaulted: 'متعثر', cancelled: 'ملغي',
};
const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700', active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700', defaulted: 'bg-red-100 text-red-700',
  cancelled: 'bg-yellow-100 text-yellow-700',
};
const instStatusLabels: Record<string, string> = {
  pending: 'معلق', paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر',
};
const instStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-blue-100 text-blue-700', overdue: 'bg-red-100 text-red-700',
};

const inputClass = 'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Contract | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await api.get<{ data: Contract[]; total: number; totalPages: number }>(`/contracts?${params}`);
      setContracts(res.data); setTotal(res.total); setTotalPages(res.totalPages);
    } catch (err) { setError(err instanceof Error ? err.message : 'خطأ'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const viewDetails = async (id: number) => {
    try {
      const c = await api.get<Contract>(`/contracts/${id}`);
      setSelected(c);
    } catch { /* ignore */ }
  };

  if (selected) {
    return <ContractDetails contract={selected} onBack={() => { setSelected(null); fetch(); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">العقود</h1>
          <p className="text-gray-500 text-sm">إجمالي: {total} عقد</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">+ إنشاء عقد</button>
      </div>

      {showAdd && <AddContractForm onSuccess={() => { setShowAdd(false); fetch(); }} onCancel={() => setShowAdd(false)} />}

      <div className="bg-white rounded-xl border">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetch(); }} className="flex items-center gap-3 p-4 border-b">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم العقد أو اسم العميل..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          <button type="submit" className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm">بحث</button>
        </form>

        {error && <div className="bg-red-50 text-red-700 p-4 text-sm">{error}</div>}

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">جاري التحميل...</div>
        ) : contracts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">لا توجد عقود بعد</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-start font-medium">رقم العقد</th>
                <th className="px-4 py-3 text-start font-medium">العميل</th>
                <th className="px-4 py-3 text-start font-medium">المبلغ الإجمالي</th>
                <th className="px-4 py-3 text-start font-medium">الأقساط</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">إجراء</th>
              </tr></thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.contractNumber}</td>
                    <td className="px-4 py-3">{c.customer?.name || '-'}</td>
                    <td className="px-4 py-3">{Number(c.totalAmount).toLocaleString('ar-SA')} د.أ</td>
                    <td className="px-4 py-3">{c.installmentCount} × {Number(c.installmentAmount).toLocaleString('ar-SA')}</td>
                    <td className="px-4 py-3 text-gray-600">{c.contractDate}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}>{statusLabels[c.status] || c.status}</span></td>
                    <td className="px-4 py-3"><button onClick={() => viewDetails(c.id)} className="text-emerald-600 hover:text-emerald-800 text-sm">التفاصيل</button></td>
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

function ContractDetails({ contract, onBack }: { contract: Contract; onBack: () => void }) {
  const paidCount = contract.installments?.filter((i) => i.status === 'paid').length || 0;
  const totalPaid = contract.installments?.reduce((s, i) => s + Number(i.paidAmount), 0) || 0;
  const totalDue = contract.installments?.reduce((s, i) => s + Number(i.amount), 0) || 0;

  return (
    <div>
      <button onClick={onBack} className="text-emerald-600 hover:text-emerald-800 mb-4 text-sm">→ العودة للقائمة</button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">عقد {contract.contractNumber}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[contract.status] || ''}`}>{statusLabels[contract.status] || contract.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">العميل:</span> <span className="font-medium">{contract.customer?.name}</span></div>
            <div><span className="text-gray-500">تاريخ العقد:</span> <span>{contract.contractDate}</span></div>
            <div><span className="text-gray-500">المبلغ الإجمالي:</span> <span className="font-medium">{Number(contract.totalAmount).toLocaleString('ar-SA')} د.أ</span></div>
            <div><span className="text-gray-500">الدفعة الأولى:</span> <span>{Number(contract.downPayment).toLocaleString('ar-SA')} د.أ</span></div>
            <div><span className="text-gray-500">المبلغ الممول:</span> <span>{Number(contract.financedAmount).toLocaleString('ar-SA')} د.أ</span></div>
            <div><span className="text-gray-500">نسبة الربح:</span> <span>{contract.profitRate}%</span></div>
            <div><span className="text-gray-500">عدد الأقساط:</span> <span>{contract.installmentCount}</span></div>
            <div><span className="text-gray-500">قيمة القسط:</span> <span>{Number(contract.installmentAmount).toLocaleString('ar-SA')} د.أ</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-1">المدفوع</p>
            <p className="text-2xl font-bold text-emerald-700">{totalPaid.toLocaleString('ar-SA')} د.أ</p>
            <p className="text-xs text-gray-500 mt-1">{paidCount} من {contract.installmentCount} قسط</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-1">المتبقي</p>
            <p className="text-2xl font-bold text-blue-700">{(totalDue - totalPaid).toLocaleString('ar-SA')} د.أ</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">جدول الأقساط</h3>
        {contract.installments && contract.installments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-start font-medium">#</th>
                <th className="px-4 py-3 text-start font-medium">المبلغ</th>
                <th className="px-4 py-3 text-start font-medium">المدفوع</th>
                <th className="px-4 py-3 text-start font-medium">تاريخ الاستحقاق</th>
                <th className="px-4 py-3 text-start font-medium">تاريخ الدفع</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
              </tr></thead>
              <tbody>
                {contract.installments.map((i) => (
                  <tr key={i.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{i.installmentNumber}</td>
                    <td className="px-4 py-3">{Number(i.amount).toLocaleString('ar-SA')} د.أ</td>
                    <td className="px-4 py-3">{Number(i.paidAmount).toLocaleString('ar-SA')} د.أ</td>
                    <td className="px-4 py-3">{i.dueDate}</td>
                    <td className="px-4 py-3">{i.paidDate || '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${instStatusColors[i.status] || ''}`}>{instStatusLabels[i.status] || i.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">لا توجد أقساط</p>
        )}
      </div>
    </div>
  );
}

function AddContractForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    contractNumber: '', customerId: '', contractDate: '', totalAmount: '',
    downPayment: '0', financedAmount: '', profitRate: '0', installmentCount: '12',
    installmentAmount: '', firstInstallmentDate: '', description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await api.post('/contracts', {
        ...form,
        customerId: Number(form.customerId),
        totalAmount: Number(form.totalAmount),
        downPayment: Number(form.downPayment),
        financedAmount: Number(form.financedAmount),
        profitRate: Number(form.profitRate),
        installmentCount: Number(form.installmentCount),
        installmentAmount: Number(form.installmentAmount),
      });
      onSuccess();
    } catch (err) { setError(err instanceof Error ? err.message : 'خطأ'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">إنشاء عقد جديد</h2>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم العقد *</label><input required value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} className={inputClass} placeholder="CNT-2026-001" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم العميل (ID) *</label><input required type="number" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">تاريخ العقد *</label><input required type="date" value={form.contractDate} onChange={(e) => setForm({ ...form, contractDate: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">المبلغ الإجمالي *</label><input required type="number" step="0.01" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">الدفعة الأولى</label><input type="number" step="0.01" value={form.downPayment} onChange={(e) => setForm({ ...form, downPayment: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">المبلغ الممول *</label><input required type="number" step="0.01" value={form.financedAmount} onChange={(e) => setForm({ ...form, financedAmount: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">نسبة الربح %</label><input type="number" step="0.01" value={form.profitRate} onChange={(e) => setForm({ ...form, profitRate: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">عدد الأقساط *</label><input required type="number" value={form.installmentCount} onChange={(e) => setForm({ ...form, installmentCount: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">قيمة القسط *</label><input required type="number" step="0.01" value={form.installmentAmount} onChange={(e) => setForm({ ...form, installmentAmount: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">تاريخ أول قسط</label><input type="date" value={form.firstInstallmentDate} onChange={(e) => setForm({ ...form, firstInstallmentDate: e.target.value })} className={inputClass} /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></div>
        <div className="flex items-end gap-2">
          <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'جاري الحفظ...' : 'حفظ'}</button>
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-300">إلغاء</button>
        </div>
      </form>
    </div>
  );
}
