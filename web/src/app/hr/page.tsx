'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface Employee {
  id: number;
  employeeNumber: string;
  name: string;
  position: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  hireDate: string | null;
  salary: number | null;
  isActive: boolean;
}

interface Attendance {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  employee?: { id: number; name: string };
}

interface PayrollRun {
  id: number;
  month: string;
  totalSalaries: number;
  totalDeductions: number;
  totalNet: number;
  status: string;
}

const attendanceStatusLabels: Record<string, string> = {
  present: 'حاضر',
  absent: 'غائب',
  late: 'متأخر',
  leave: 'إجازة',
};
const attendanceStatusColors: Record<string, string> = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
  leave: 'bg-blue-100 text-blue-700',
};
const payrollStatusLabels: Record<string, string> = {
  draft: 'مسودة',
  approved: 'معتمد',
  paid: 'مدفوع',
};
const payrollStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
};

const inputClass =
  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

type Tab = 'employees' | 'attendance' | 'payroll';

export default function HrPage() {
  const [activeTab, setActiveTab] = useState<Tab>('employees');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'employees', label: 'الموظفون' },
    { key: 'attendance', label: 'الحضور' },
    { key: 'payroll', label: 'الرواتب' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        الموارد البشرية
      </h1>

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

      {activeTab === 'employees' && <EmployeesTab />}
      {activeTab === 'attendance' && <AttendanceTab />}
      {activeTab === 'payroll' && <PayrollTab />}
    </div>
  );
}

function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      const res = await api.get<{
        data: Employee[];
        total: number;
        totalPages: number;
      }>(`/hr/employees?${params}`);
      setEmployees(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الموظفين');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await api.delete(`/hr/employees/${id}`);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">إجمالي: {total} موظف</p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          + إضافة موظف
        </button>
      </div>

      {showForm && (
        <EmployeeForm
          employee={editing}
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
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا يوجد موظفون بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">
                    رقم الموظف
                  </th>
                  <th className="px-4 py-3 text-start font-medium">الاسم</th>
                  <th className="px-4 py-3 text-start font-medium">
                    المنصب
                  </th>
                  <th className="px-4 py-3 text-start font-medium">القسم</th>
                  <th className="px-4 py-3 text-start font-medium">الراتب</th>
                  <th className="px-4 py-3 text-start font-medium">الحالة</th>
                  <th className="px-4 py-3 text-start font-medium">
                    تاريخ التعيين
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {emp.employeeNumber}
                    </td>
                    <td className="px-4 py-3">{emp.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.position || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {emp.department || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {emp.salary != null
                        ? `${Number(emp.salary).toLocaleString('ar-SA')} د.أ`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {emp.isActive ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          نشط
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          غير نشط
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {emp.hireDate || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditing(emp);
                            setShowForm(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-800 text-sm"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
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

function EmployeeForm({
  employee,
  onSuccess,
  onCancel,
}: {
  employee: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    employeeNumber: employee?.employeeNumber || '',
    name: employee?.name || '',
    position: employee?.position || '',
    department: employee?.department || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    hireDate: employee?.hireDate || '',
    salary: employee?.salary?.toString() || '',
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
        salary: form.salary ? Number(form.salary) : undefined,
      };
      if (employee) {
        await api.put(`/hr/employees/${employee.id}`, payload);
      } else {
        await api.post('/hr/employees', payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حفظ الموظف');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">
        {employee ? 'تعديل موظف' : 'إضافة موظف جديد'}
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
            رقم الموظف *
          </label>
          <input
            required
            value={form.employeeNumber}
            onChange={(e) =>
              setForm({ ...form, employeeNumber: e.target.value })
            }
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
            المنصب
          </label>
          <input
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            القسم
          </label>
          <input
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
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
            تاريخ التعيين
          </label>
          <input
            type="date"
            value={form.hireDate}
            onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الراتب
          </label>
          <input
            type="number"
            step="0.01"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
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

function AttendanceTab() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEmployee) params.set('employeeId', filterEmployee);
      if (filterDate) params.set('date', filterDate);
      const res = await api.get<{ data: Attendance[] }>(
        `/hr/attendance?${params}`,
      );
      setRecords(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل سجل الحضور');
    } finally {
      setLoading(false);
    }
  }, [filterEmployee, filterDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            placeholder="رقم الموظف"
            className="px-3 py-2 border rounded-lg text-sm w-36"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
        >
          + تسجيل حضور
        </button>
      </div>

      {showForm && (
        <AttendanceForm
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
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا توجد سجلات حضور
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">
                    الموظف
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    وقت الحضور
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    وقت الانصراف
                  </th>
                  <th className="px-4 py-3 text-start font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {r.employee?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.date}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.checkIn || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.checkOut || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${attendanceStatusColors[r.status] || ''}`}
                      >
                        {attendanceStatusLabels[r.status] || r.status}
                      </span>
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

function AttendanceForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    employeeId: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'present',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/hr/attendance', {
        ...form,
        employeeId: Number(form.employeeId),
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الحضور');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">تسجيل حضور</h2>
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
            رقم الموظف (ID) *
          </label>
          <input
            required
            type="number"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
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
            وقت الحضور
          </label>
          <input
            type="time"
            value={form.checkIn}
            onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            وقت الانصراف
          </label>
          <input
            type="time"
            value={form.checkOut}
            onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحالة *
          </label>
          <select
            required
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={inputClass}
          >
            <option value="present">حاضر</option>
            <option value="absent">غائب</option>
            <option value="late">متأخر</option>
            <option value="leave">إجازة</option>
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

function PayrollTab() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState('');
  const [running, setRunning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: PayrollRun[] }>('/hr/payroll');
      setRuns(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الرواتب');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runPayroll = async () => {
    if (!month) return;
    setRunning(true);
    setError('');
    try {
      await api.post('/hr/payroll', { month });
      setMonth('');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تشغيل الرواتب');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="YYYY-MM"
          className="px-3 py-2 border rounded-lg text-sm"
        />
        <button
          onClick={runPayroll}
          disabled={!month || running}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {running ? 'جاري التشغيل...' : 'تشغيل الرواتب'}
        </button>
      </div>

      <div className="bg-white rounded-xl border">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">
            جاري التحميل...
          </div>
        ) : runs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا توجد دورات رواتب بعد
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="px-4 py-3 text-start font-medium">الشهر</th>
                  <th className="px-4 py-3 text-start font-medium">
                    إجمالي الرواتب
                  </th>
                  <th className="px-4 py-3 text-start font-medium">
                    الاستقطاعات
                  </th>
                  <th className="px-4 py-3 text-start font-medium">الصافي</th>
                  <th className="px-4 py-3 text-start font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{r.month}</td>
                    <td className="px-4 py-3">
                      {Number(r.totalSalaries).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {Number(r.totalDeductions).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="px-4 py-3 text-emerald-700 font-medium">
                      {Number(r.totalNet).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${payrollStatusColors[r.status] || ''}`}
                      >
                        {payrollStatusLabels[r.status] || r.status}
                      </span>
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
