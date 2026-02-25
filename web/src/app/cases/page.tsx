'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface JudiciaryCase {
  id: number;
  caseNumber: string;
  caseType: string;
  status: string;
  court: string | null;
  lawyer: string | null;
  filingDate: string;
  nextSessionDate: string | null;
  claimAmount: number | null;
  description: string | null;
  customer?: { id: number; name: string };
}

interface FollowUp {
  id: number;
  type: string;
  status: string;
  followUpDate: string;
  notes: string | null;
  result: string | null;
  customer?: { id: number; name: string };
}

const caseStatusLabels: Record<string, string> = { open: 'مفتوحة', in_progress: 'قيد النظر', closed: 'مغلقة', suspended: 'معلقة' };
const caseStatusColors: Record<string, string> = { open: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', closed: 'bg-gray-100 text-gray-700', suspended: 'bg-red-100 text-red-700' };
const caseTypeLabels: Record<string, string> = { execution: 'تنفيذ', rights: 'حقوق', criminal: 'جزاء' };
const fuTypeLabels: Record<string, string> = { call: 'اتصال', visit: 'زيارة', sms: 'رسالة', legal: 'قانوني', other: 'أخرى' };
const fuStatusLabels: Record<string, string> = { pending: 'معلق', done: 'تم', cancelled: 'ملغي' };
const fuStatusColors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', done: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' };

const inputClass = 'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

type Tab = 'cases' | 'followups';

export default function CasesPage() {
  const [tab, setTab] = useState<Tab>('cases');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">القضايا والمتابعة</h1>
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('cases')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'cases' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-800'}`}>القضايا</button>
        <button onClick={() => setTab('followups')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'followups' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-800'}`}>المتابعة</button>
      </div>
      {tab === 'cases' ? <CasesTab /> : <FollowUpsTab />}
    </div>
  );
}

function CasesTab() {
  const [cases, setCases] = useState<JudiciaryCase[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await api.get<{ data: JudiciaryCase[]; total: number; totalPages: number }>(`/judiciary?${params}`);
      setCases(res.data); setTotal(res.total); setTotalPages(res.totalPages);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">إجمالي: {total} قضية</p>
        <button onClick={() => setShowAdd(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">+ قضية جديدة</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">إضافة قضية جديدة</h2>
          <AddCaseForm onSuccess={() => { setShowAdd(false); fetchCases(); }} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="bg-white rounded-xl border">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchCases(); }} className="flex items-center gap-3 p-4 border-b">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم القضية أو اسم العميل..." className="flex-1 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          <button type="submit" className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm">بحث</button>
        </form>

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">جاري التحميل...</div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-gray-400">لا توجد قضايا</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-start font-medium">رقم القضية</th>
                <th className="px-4 py-3 text-start font-medium">العميل</th>
                <th className="px-4 py-3 text-start font-medium">النوع</th>
                <th className="px-4 py-3 text-start font-medium">المحكمة</th>
                <th className="px-4 py-3 text-start font-medium">المبلغ</th>
                <th className="px-4 py-3 text-start font-medium">تاريخ التقديم</th>
                <th className="px-4 py-3 text-start font-medium">الجلسة القادمة</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
              </tr></thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.caseNumber}</td>
                    <td className="px-4 py-3">{c.customer?.name || '-'}</td>
                    <td className="px-4 py-3">{caseTypeLabels[c.caseType] || c.caseType}</td>
                    <td className="px-4 py-3 text-gray-600">{c.court || '-'}</td>
                    <td className="px-4 py-3">{c.claimAmount ? `${Number(c.claimAmount).toLocaleString('ar-SA')} د.أ` : '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.filingDate}</td>
                    <td className="px-4 py-3 text-gray-600">{c.nextSessionDate || '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${caseStatusColors[c.status] || ''}`}>{caseStatusLabels[c.status] || c.status}</span></td>
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

function FollowUpsTab() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get<{ data: FollowUp[]; total: number; totalPages: number }>(`/follow-ups?${params}`);
      setFollowUps(res.data); setTotal(res.total); setTotalPages(res.totalPages);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  const markDone = async (id: number) => {
    try {
      await api.put(`/follow-ups/${id}`, { status: 'done' });
      fetchFollowUps();
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">إجمالي: {total} متابعة</p>
        <button onClick={() => setShowAdd(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">+ متابعة جديدة</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">إضافة متابعة جديدة</h2>
          <AddFollowUpForm onSuccess={() => { setShowAdd(false); fetchFollowUps(); }} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="bg-white rounded-xl border">
        <div className="flex items-center gap-3 p-4 border-b">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg text-sm">
            <option value="">كل الحالات</option>
            <option value="pending">معلق</option>
            <option value="done">تم</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">جاري التحميل...</div>
        ) : followUps.length === 0 ? (
          <div className="p-8 text-center text-gray-400">لا توجد متابعات</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-gray-600">
                <th className="px-4 py-3 text-start font-medium">العميل</th>
                <th className="px-4 py-3 text-start font-medium">النوع</th>
                <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                <th className="px-4 py-3 text-start font-medium">ملاحظات</th>
                <th className="px-4 py-3 text-start font-medium">النتيجة</th>
                <th className="px-4 py-3 text-start font-medium">الحالة</th>
                <th className="px-4 py-3 text-start font-medium">إجراء</th>
              </tr></thead>
              <tbody>
                {followUps.map((f) => (
                  <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{f.customer?.name || '-'}</td>
                    <td className="px-4 py-3">{fuTypeLabels[f.type] || f.type}</td>
                    <td className="px-4 py-3 text-gray-600">{f.followUpDate}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-48 truncate">{f.notes || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-48 truncate">{f.result || '-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${fuStatusColors[f.status] || ''}`}>{fuStatusLabels[f.status] || f.status}</span></td>
                    <td className="px-4 py-3">
                      {f.status === 'pending' && (
                        <button onClick={() => markDone(f.id)} className="text-emerald-600 hover:text-emerald-800 text-sm">تم</button>
                      )}
                    </td>
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

function AddCaseForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ caseNumber: '', customerId: '', caseType: 'execution', filingDate: '', court: '', lawyer: '', claimAmount: '', nextSessionDate: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await api.post('/judiciary', {
        ...form, customerId: Number(form.customerId),
        claimAmount: form.claimAmount ? Number(form.claimAmount) : undefined,
        nextSessionDate: form.nextSessionDate || undefined,
      });
      onSuccess();
    } catch (err) { setError(err instanceof Error ? err.message : 'خطأ'); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم القضية *</label><input required value={form.caseNumber} onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} className={inputClass} placeholder="CASE-2026-001" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم العميل (ID) *</label><input required type="number" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">نوع القضية *</label>
          <select required value={form.caseType} onChange={(e) => setForm({ ...form, caseType: e.target.value })} className={inputClass}>
            <option value="execution">تنفيذ</option><option value="rights">حقوق</option><option value="criminal">جزاء</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التقديم *</label><input required type="date" value={form.filingDate} onChange={(e) => setForm({ ...form, filingDate: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">المحكمة</label><input value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">المحامي</label><input value={form.lawyer} onChange={(e) => setForm({ ...form, lawyer: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">مبلغ المطالبة</label><input type="number" step="0.01" value={form.claimAmount} onChange={(e) => setForm({ ...form, claimAmount: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">الجلسة القادمة</label><input type="date" value={form.nextSessionDate} onChange={(e) => setForm({ ...form, nextSessionDate: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></div>
        <div className="flex items-end gap-2">
          <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'جاري الحفظ...' : 'حفظ'}</button>
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-300">إلغاء</button>
        </div>
      </form>
    </>
  );
}

function AddFollowUpForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ customerId: '', type: 'call', followUpDate: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setError('');
    try {
      await api.post('/follow-ups', { ...form, customerId: Number(form.customerId) });
      onSuccess();
    } catch (err) { setError(err instanceof Error ? err.message : 'خطأ'); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">رقم العميل (ID) *</label><input required type="number" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className={inputClass} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">نوع المتابعة *</label>
          <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
            <option value="call">اتصال</option><option value="visit">زيارة</option><option value="sms">رسالة</option><option value="legal">قانوني</option><option value="other">أخرى</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">تاريخ المتابعة *</label><input required type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} className={inputClass} /></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} /></div>
        <div className="flex items-end gap-2">
          <button type="submit" disabled={submitting} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'جاري الحفظ...' : 'حفظ'}</button>
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-300">إلغاء</button>
        </div>
      </form>
    </>
  );
}
