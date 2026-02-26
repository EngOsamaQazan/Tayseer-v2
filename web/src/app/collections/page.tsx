'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Collection {
  id: number;
  totalAmount: number;
  collectedAmount: number;
  remainingAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  status: string;
  notes: string | null;
  customer?: { id: number; name: string };
  installments?: CollectionInstallment[];
}

interface CollectionInstallment {
  id: number;
  installmentNumber: number;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
}

interface CollectionsResponse {
  data: Collection[];
  total: number;
  totalPages: number;
}

const statusLabels: Record<string, string> = {
  active: 'نشط',
  completed: 'مكتمل',
  defaulted: 'متعثر',
  cancelled: 'ملغي',
};
const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  defaulted: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};
const instStatusLabels: Record<string, string> = {
  pending: 'معلق',
  paid: 'مدفوع',
  partial: 'جزئي',
  overdue: 'متأخر',
};
const instStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
};

const inputClass =
  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Collection | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      const res = await api.get<CollectionsResponse>(
        `/collections?${params}`,
      );
      setCollections(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل التحصيلات');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const viewDetails = async (id: number) => {
    try {
      const c = await api.get<Collection>(`/collections/${id}`);
      setSelected(c);
    } catch {
      /* ignore */
    }
  };

  const payInstallment = async (installmentId: number, amount: number) => {
    try {
      await api.post(`/collections/installments/${installmentId}/pay`, {
        amount,
      });
      if (selected) {
        const updated = await api.get<Collection>(
          `/collections/${selected.id}`,
        );
        setSelected(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدفعة');
    }
  };

  if (selected) {
    return (
      <CollectionDetails
        collection={selected}
        onBack={() => {
          setSelected(null);
          fetchData();
        }}
        onPay={payInstallment}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">التحصيل</h1>
          <p className="text-gray-500 text-sm">إجمالي: {total} عملية تحصيل</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          + إضافة تحصيل
        </button>
      </div>

      {showAdd && (
        <AddCollectionForm
          onSuccess={() => {
            setShowAdd(false);
            fetchData();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="bg-white rounded-xl border">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">
            جاري التحميل...
          </div>
        ) : collections.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا توجد عمليات تحصيل بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">#</th>
                  <th className="px-4 py-3 text-start font-medium">العميل</th>
                  <th className="px-4 py-3 text-start font-medium">
                    المبلغ الإجمالي
                  </th>
                  <th className="px-4 py-3 text-start font-medium">المحصّل</th>
                  <th className="px-4 py-3 text-start font-medium">المتبقي</th>
                  <th className="px-4 py-3 text-start font-medium">الحالة</th>
                  <th className="px-4 py-3 text-start font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((c, index) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {(page - 1) * 20 + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {c.customer?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {Number(c.totalAmount).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="px-4 py-3 text-emerald-700">
                      {Number(c.collectedAmount).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {Number(c.remainingAmount).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[c.status] || ''}`}
                      >
                        {statusLabels[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewDetails(c.id)}
                        className="text-emerald-600 hover:text-emerald-800 text-sm"
                      >
                        التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-500">
              صفحة {page} من {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
              >
                السابق
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionDetails({
  collection,
  onBack,
  onPay,
}: {
  collection: Collection;
  onBack: () => void;
  onPay: (installmentId: number, amount: number) => Promise<void>;
}) {
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const handlePay = async (installmentId: number) => {
    if (!payAmount || Number(payAmount) <= 0) return;
    await onPay(installmentId, Number(payAmount));
    setPayingId(null);
    setPayAmount('');
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="text-emerald-600 hover:text-emerald-800 mb-4 text-sm"
      >
        → العودة للقائمة
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              تحصيل - {collection.customer?.name}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[collection.status] || ''}`}
            >
              {statusLabels[collection.status] || collection.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">المبلغ الإجمالي:</span>{' '}
              <span className="font-medium">
                {Number(collection.totalAmount).toLocaleString('ar-SA')} د.أ
              </span>
            </div>
            <div>
              <span className="text-gray-500">عدد الأقساط:</span>{' '}
              <span>{collection.installmentCount}</span>
            </div>
            <div>
              <span className="text-gray-500">قيمة القسط:</span>{' '}
              <span>
                {Number(collection.installmentAmount).toLocaleString('ar-SA')}{' '}
                د.أ
              </span>
            </div>
            <div>
              <span className="text-gray-500">تاريخ أول قسط:</span>{' '}
              <span>{collection.firstDueDate}</span>
            </div>
            {collection.notes && (
              <div className="col-span-2">
                <span className="text-gray-500">ملاحظات:</span>{' '}
                <span>{collection.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-1">المحصّل</p>
            <p className="text-2xl font-bold text-emerald-700">
              {Number(collection.collectedAmount).toLocaleString('ar-SA')} د.أ
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-1">المتبقي</p>
            <p className="text-2xl font-bold text-red-700">
              {Number(collection.remainingAmount).toLocaleString('ar-SA')} د.أ
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">جدول الأقساط</h3>
        {collection.installments && collection.installments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">#</th>
                  <th className="px-4 py-3 text-start font-medium">المبلغ</th>
                  <th className="px-4 py-3 text-start font-medium">
                    المدفوع
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    تاريخ الاستحقاق
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    تاريخ الدفع
                  </th>
                  <th className="px-4 py-3 text-start font-medium">الحالة</th>
                  <th className="px-4 py-3 text-start font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {collection.installments.map((inst) => (
                  <tr key={inst.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{inst.installmentNumber}</td>
                    <td className="px-4 py-3">
                      {Number(inst.amount).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="px-4 py-3">
                      {Number(inst.paidAmount).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="px-4 py-3">{inst.dueDate}</td>
                    <td className="px-4 py-3">{inst.paidDate || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${instStatusColors[inst.status] || ''}`}
                      >
                        {instStatusLabels[inst.status] || inst.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {inst.status !== 'paid' && (
                        <>
                          {payingId === inst.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                placeholder="المبلغ"
                                className="w-24 px-2 py-1 border rounded text-sm"
                              />
                              <button
                                onClick={() => handlePay(inst.id)}
                                className="text-emerald-600 hover:text-emerald-800 text-sm"
                              >
                                تأكيد
                              </button>
                              <button
                                onClick={() => {
                                  setPayingId(null);
                                  setPayAmount('');
                                }}
                                className="text-gray-400 hover:text-gray-600 text-sm"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setPayingId(inst.id)}
                              className="text-emerald-600 hover:text-emerald-800 text-sm"
                            >
                              تسديد
                            </button>
                          )}
                        </>
                      )}
                    </td>
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

function AddCollectionForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    customerId: '',
    totalAmount: '',
    installmentCount: '',
    installmentAmount: '',
    firstDueDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/collections', {
        customerId: Number(form.customerId),
        totalAmount: Number(form.totalAmount),
        installmentCount: Number(form.installmentCount),
        installmentAmount: Number(form.installmentAmount),
        firstDueDate: form.firstDueDate,
        notes: form.notes || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إضافة التحصيل');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">إضافة تحصيل جديد</h2>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            رقم العميل (ID) *
          </label>
          <input
            required
            type="number"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المبلغ الإجمالي *
          </label>
          <input
            required
            type="number"
            step="0.01"
            value={form.totalAmount}
            onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عدد الأقساط *
          </label>
          <input
            required
            type="number"
            value={form.installmentCount}
            onChange={(e) =>
              setForm({ ...form, installmentCount: e.target.value })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            قيمة القسط *
          </label>
          <input
            required
            type="number"
            step="0.01"
            value={form.installmentAmount}
            onChange={(e) =>
              setForm({ ...form, installmentAmount: e.target.value })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تاريخ أول قسط *
          </label>
          <input
            required
            type="date"
            value={form.firstDueDate}
            onChange={(e) => setForm({ ...form, firstDueDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ملاحظات
          </label>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-300"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
