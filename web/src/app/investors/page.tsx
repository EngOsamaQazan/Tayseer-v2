'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface BankAccount {
  id?: number;
  bankName: string;
  bankNumber: string;
  ibanNumber: string;
}

interface Company {
  id: number;
  name: string;
  phoneNumber: string;
  email: string | null;
  address: string | null;
  socialSecurityNumber: string | null;
  taxNumber: string | null;
  isPrimaryCompany: boolean;
  profitShareRatio: number | null;
  parentShareRatio: number | null;
  createdAt: string;
  bankAccounts?: BankAccount[];
}

interface CompaniesResponse {
  data: Company[];
  total: number;
}

const inputClass =
  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

export default function InvestorsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<CompaniesResponse>('/companies');
      setCompanies(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل المستثمرين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستثمر؟')) return;
    try {
      await api.delete(`/companies/${id}`);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحذف');
    }
  };

  const handleEdit = (company: Company) => {
    setEditing(company);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المستثمرون</h1>
          <p className="text-gray-500 text-sm">إجمالي: {total} مستثمر</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          + إضافة مستثمر
        </button>
      </div>

      {showForm && (
        <CompanyForm
          company={editing}
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
        ) : companies.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا يوجد مستثمرون بعد
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
                    نسبة الربح
                  </th>
                  <th className="px-4 py-3 text-start font-medium">النوع</th>
                  <th className="px-4 py-3 text-start font-medium">
                    تاريخ التسجيل
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.phoneNumber || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.profitShareRatio != null
                        ? `${c.profitShareRatio}%`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {c.isPrimaryCompany ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          رئيسي
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          فرعي
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(c)}
                          className="text-emerald-600 hover:text-emerald-800 text-sm"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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

function CompanyForm({
  company,
  onSuccess,
  onCancel,
}: {
  company: Company | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: company?.name || '',
    phoneNumber: company?.phoneNumber || '',
    email: company?.email || '',
    address: company?.address || '',
    socialSecurityNumber: company?.socialSecurityNumber || '',
    taxNumber: company?.taxNumber || '',
    isPrimaryCompany: company?.isPrimaryCompany || false,
    profitShareRatio: company?.profitShareRatio?.toString() || '',
    parentShareRatio: company?.parentShareRatio?.toString() || '',
  });
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(
    company?.bankAccounts || [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addBankAccount = () => {
    setBankAccounts([
      ...bankAccounts,
      { bankName: '', bankNumber: '', ibanNumber: '' },
    ]);
  };

  const removeBankAccount = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index));
  };

  const updateBankAccount = (
    index: number,
    field: keyof BankAccount,
    value: string,
  ) => {
    const updated = [...bankAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setBankAccounts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        profitShareRatio: form.profitShareRatio
          ? Number(form.profitShareRatio)
          : undefined,
        parentShareRatio: form.parentShareRatio
          ? Number(form.parentShareRatio)
          : undefined,
        bankAccounts: bankAccounts.filter((b) => b.bankName || b.bankNumber),
      };
      if (company) {
        await api.put(`/companies/${company.id}`, payload);
      } else {
        await api.post('/companies', payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حفظ المستثمر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">
        {company ? 'تعديل مستثمر' : 'إضافة مستثمر جديد'}
      </h2>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              رقم الهاتف *
            </label>
            <input
              required
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
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
              رقم الضمان الاجتماعي
            </label>
            <input
              value={form.socialSecurityNumber}
              onChange={(e) =>
                setForm({ ...form, socialSecurityNumber: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الرقم الضريبي
            </label>
            <input
              value={form.taxNumber}
              onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نسبة ربح الشريك %
            </label>
            <input
              type="number"
              step="0.01"
              value={form.profitShareRatio}
              onChange={(e) =>
                setForm({ ...form, profitShareRatio: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نسبة ربح الشركة الأم %
            </label>
            <input
              type="number"
              step="0.01"
              value={form.parentShareRatio}
              onChange={(e) =>
                setForm({ ...form, parentShareRatio: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isPrimary"
              checked={form.isPrimaryCompany}
              onChange={(e) =>
                setForm({ ...form, isPrimaryCompany: e.target.checked })
              }
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="isPrimary" className="text-sm text-gray-700">
              شركة رئيسية
            </label>
          </div>
        </div>

        <div className="border-t pt-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              الحسابات البنكية
            </h3>
            <button
              type="button"
              onClick={addBankAccount}
              className="text-emerald-600 hover:text-emerald-800 text-sm"
            >
              + إضافة حساب
            </button>
          </div>
          {bankAccounts.map((bank, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  اسم البنك
                </label>
                <input
                  value={bank.bankName}
                  onChange={(e) =>
                    updateBankAccount(index, 'bankName', e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  رقم الحساب
                </label>
                <input
                  value={bank.bankNumber}
                  onChange={(e) =>
                    updateBankAccount(index, 'bankNumber', e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  رقم IBAN
                </label>
                <input
                  value={bank.ibanNumber}
                  onChange={(e) =>
                    updateBankAccount(index, 'ibanNumber', e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeBankAccount(index)}
                  className="text-red-500 hover:text-red-700 text-sm px-3 py-2"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
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
