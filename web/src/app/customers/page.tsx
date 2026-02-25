'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, Customer } from '@/lib/api';

interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (search) params.set('search', search);

      const res = await api.get<CustomersResponse>(
        `/customers?${params.toString()}`,
      );
      setCustomers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل العملاء');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">العملاء</h1>
          <p className="text-gray-500 text-sm">إجمالي: {total} عميل</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          + إضافة عميل
        </button>
      </div>

      {showAdd && (
        <AddCustomerForm
          onSuccess={() => {
            setShowAdd(false);
            fetchCustomers();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="bg-white rounded-xl border mb-4">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 p-4 border-b"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو رقم الهوية أو الهاتف..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800"
          >
            بحث
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">
            جاري التحميل...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا يوجد عملاء بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">#</th>
                  <th className="px-4 py-3 text-start font-medium">الاسم</th>
                  <th className="px-4 py-3 text-start font-medium">
                    رقم الهوية
                  </th>
                  <th className="px-4 py-3 text-start font-medium">الهاتف</th>
                  <th className="px-4 py-3 text-start font-medium">
                    البريد
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    المدينة
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    تاريخ التسجيل
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, index) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {(page - 1) * 20 + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.idNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.primaryPhoneNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.city || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('ar-SA')}
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

function AddCustomerForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    idNumber: '',
    primaryPhoneNumber: '',
    email: '',
    city: '',
    birthDate: '',
    sex: 1,
    citizen: 'أردني',
    hearAboutUs: 'إعلان',
    isSocialSecurity: 0,
    doHaveAnyProperty: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/customers', form);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إضافة العميل');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">إضافة عميل جديد</h2>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم الكامل *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهوية *
          </label>
          <input
            type="text"
            required
            value={form.idNumber}
            onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهاتف *
          </label>
          <input
            type="text"
            required
            value={form.primaryPhoneNumber}
            onChange={(e) =>
              setForm({ ...form, primaryPhoneNumber: e.target.value })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تاريخ الميلاد *
          </label>
          <input
            type="date"
            required
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الجنس *
          </label>
          <select
            value={form.sex}
            onChange={(e) => setForm({ ...form, sex: Number(e.target.value) })}
            className={inputClass}
          >
            <option value={1}>ذكر</option>
            <option value={2}>أنثى</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المدينة *
          </label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الجنسية *
          </label>
          <input
            type="text"
            required
            value={form.citizen}
            onChange={(e) => setForm({ ...form, citizen: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            كيف سمعت عنا *
          </label>
          <input
            type="text"
            required
            value={form.hearAboutUs}
            onChange={(e) =>
              setForm({ ...form, hearAboutUs: e.target.value })
            }
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
            ضمان اجتماعي
          </label>
          <select
            value={form.isSocialSecurity}
            onChange={(e) =>
              setForm({ ...form, isSocialSecurity: Number(e.target.value) })
            }
            className={inputClass}
          >
            <option value={0}>لا</option>
            <option value={1}>نعم</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            يملك عقار
          </label>
          <select
            value={form.doHaveAnyProperty}
            onChange={(e) =>
              setForm({
                ...form,
                doHaveAnyProperty: Number(e.target.value),
              })
            }
            className={inputClass}
          >
            <option value={0}>لا</option>
            <option value={1}>نعم</option>
          </select>
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
