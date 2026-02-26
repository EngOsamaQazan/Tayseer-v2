'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unitCost: number | null;
  unitPrice: number | null;
  reorderLevel: number | null;
}

interface Movement {
  id: number;
  type: string;
  quantity: number;
  date: string;
  reason: string | null;
  item?: { id: number; name: string };
}

interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactPerson: string | null;
}

const movementTypeLabels: Record<string, string> = {
  in: 'وارد',
  out: 'صادر',
  adjustment: 'تعديل',
};
const movementTypeColors: Record<string, string> = {
  in: 'bg-emerald-100 text-emerald-700',
  out: 'bg-red-100 text-red-700',
  adjustment: 'bg-blue-100 text-blue-700',
};

const inputClass =
  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

type Tab = 'items' | 'movements' | 'suppliers';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('items');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'items', label: 'الأصناف' },
    { key: 'movements', label: 'الحركات' },
    { key: 'suppliers', label: 'الموردون' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">المخزون</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'items' && <ItemsTab />}
      {activeTab === 'movements' && <MovementsTab />}
      {activeTab === 'suppliers' && <SuppliersTab />}
    </div>
  );
}

function ItemsTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      const res = await api.get<{
        data: InventoryItem[];
        total: number;
        totalPages: number;
      }>(`/inventory/items?${params}`);
      setItems(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الأصناف');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;
    try {
      await api.delete(`/inventory/items/${id}`);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">إجمالي: {total} صنف</p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          + إضافة صنف
        </button>
      </div>

      {showForm && (
        <ItemForm
          item={editing}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            fetchData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
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
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا توجد أصناف بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">الرمز</th>
                  <th className="px-4 py-3 text-start font-medium">الاسم</th>
                  <th className="px-4 py-3 text-start font-medium">الفئة</th>
                  <th className="px-4 py-3 text-start font-medium">الكمية</th>
                  <th className="px-4 py-3 text-start font-medium">
                    سعر التكلفة
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    سعر البيع
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    حد إعادة الطلب
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLowStock =
                    item.reorderLevel != null &&
                    item.quantity <= item.reorderLevel;
                  return (
                    <tr
                      key={item.id}
                      className={`border-b last:border-0 hover:bg-gray-50 transition-colors ${
                        isLowStock ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{item.sku}</td>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.category || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isLowStock
                              ? 'text-red-600 font-medium'
                              : 'text-gray-800'
                          }
                        >
                          {Number(item.quantity).toLocaleString('ar-SA')}
                        </span>
                        {isLowStock && (
                          <span className="mr-2 text-xs text-red-500">
                            مخزون منخفض
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.unitCost != null
                          ? `${Number(item.unitCost).toLocaleString('ar-SA')} د.أ`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.unitPrice != null
                          ? `${Number(item.unitPrice).toLocaleString('ar-SA')} د.أ`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.reorderLevel != null
                          ? Number(item.reorderLevel).toLocaleString('ar-SA')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditing(item);
                              setShowForm(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-800 text-sm"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

function ItemForm({
  item,
  onSuccess,
  onCancel,
}: {
  item: InventoryItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    sku: item?.sku || '',
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    quantity: item?.quantity?.toString() || '0',
    unitCost: item?.unitCost?.toString() || '',
    unitPrice: item?.unitPrice?.toString() || '',
    reorderLevel: item?.reorderLevel?.toString() || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        unitCost: form.unitCost ? Number(form.unitCost) : undefined,
        unitPrice: form.unitPrice ? Number(form.unitPrice) : undefined,
        reorderLevel: form.reorderLevel
          ? Number(form.reorderLevel)
          : undefined,
      };
      if (item) {
        await api.put(`/inventory/items/${item.id}`, payload);
      } else {
        await api.post('/inventory/items', payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حفظ الصنف');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">
        {item ? 'تعديل صنف' : 'إضافة صنف جديد'}
      </h2>
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
            الرمز (SKU) *
          </label>
          <input
            required
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم *
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الفئة
          </label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الكمية
          </label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            سعر التكلفة
          </label>
          <input
            type="number"
            step="0.01"
            value={form.unitCost}
            onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            سعر البيع
          </label>
          <input
            type="number"
            step="0.01"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            حد إعادة الطلب
          </label>
          <input
            type="number"
            value={form.reorderLevel}
            onChange={(e) =>
              setForm({ ...form, reorderLevel: e.target.value })
            }
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الوصف
          </label>
          <input
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
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

function MovementsTab() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterItem, setFilterItem] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterItem) params.set('itemId', filterItem);
      const res = await api.get<{ data: Movement[] }>(
        `/inventory/movements?${params}`,
      );
      setMovements(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الحركات');
    } finally {
      setLoading(false);
    }
  }, [filterItem]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          type="number"
          value={filterItem}
          onChange={(e) => setFilterItem(e.target.value)}
          placeholder="تصفية برقم الصنف"
          className="px-3 py-2 border rounded-lg text-sm w-48"
        />
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          + إضافة حركة
        </button>
      </div>

      {showForm && (
        <MovementForm
          onSuccess={() => {
            setShowForm(false);
            fetchData();
          }}
          onCancel={() => setShowForm(false)}
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
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا توجد حركات مخزون
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">الصنف</th>
                  <th className="px-4 py-3 text-start font-medium">النوع</th>
                  <th className="px-4 py-3 text-start font-medium">الكمية</th>
                  <th className="px-4 py-3 text-start font-medium">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-start font-medium">السبب</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {m.item?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${movementTypeColors[m.type] || ''}`}
                      >
                        {movementTypeLabels[m.type] || m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {Number(m.quantity).toLocaleString('ar-SA')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{m.date}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MovementForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    itemId: '',
    type: 'in',
    quantity: '',
    date: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/inventory/movements', {
        ...form,
        itemId: Number(form.itemId),
        quantity: Number(form.quantity),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إضافة الحركة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">إضافة حركة مخزون</h2>
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
            رقم الصنف (ID) *
          </label>
          <input
            required
            type="number"
            value={form.itemId}
            onChange={(e) => setForm({ ...form, itemId: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            النوع *
          </label>
          <select
            required
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={inputClass}
          >
            <option value="in">وارد</option>
            <option value="out">صادر</option>
            <option value="adjustment">تعديل</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الكمية *
          </label>
          <input
            required
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التاريخ *
          </label>
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            السبب
          </label>
          <input
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
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

function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Supplier[] }>('/inventory/suppliers');
      setSuppliers(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الموردين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    try {
      await api.delete(`/inventory/suppliers/${id}`);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">الموردون</p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          + إضافة مورد
        </button>
      </div>

      {showForm && (
        <SupplierForm
          supplier={editing}
          onSuccess={() => {
            setShowForm(false);
            setEditing(null);
            fetchData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
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
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا يوجد موردون بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">الاسم</th>
                  <th className="px-4 py-3 text-start font-medium">الهاتف</th>
                  <th className="px-4 py-3 text-start font-medium">البريد</th>
                  <th className="px-4 py-3 text-start font-medium">
                    جهة الاتصال
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {s.contactPerson || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditing(s);
                            setShowForm(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-800 text-sm"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SupplierForm({
  supplier,
  onSuccess,
  onCancel,
}: {
  supplier: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: supplier?.name || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    contactPerson: supplier?.contactPerson || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (supplier) {
        await api.put(`/inventory/suppliers/${supplier.id}`, form);
      } else {
        await api.post('/inventory/suppliers', form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حفظ المورد');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">
        {supplier ? 'تعديل مورد' : 'إضافة مورد جديد'}
      </h2>
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
            الاسم *
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الهاتف
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            العنوان
          </label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            جهة الاتصال
          </label>
          <input
            value={form.contactPerson}
            onChange={(e) =>
              setForm({ ...form, contactPerson: e.target.value })
            }
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
