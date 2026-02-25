'use client';

import { useEffect, useState } from 'react';
import { api, DashboardSummary } from '@/lib/api';

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
  };
  const textColors: Record<string, string> = {
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    red: 'text-red-700',
    purple: 'text-purple-700',
  };

  return (
    <div className={`rounded-xl border p-6 ${bgColors[color] || bgColors.emerald}`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${textColors[color] || textColors.emerald}`}>
        {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
      </p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<DashboardSummary>('/dashboard')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        خطأ: {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm">نظرة عامة على النظام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="العملاء"
          value={data.counts.customers}
          subtitle="إجمالي العملاء المسجلين"
          color="blue"
        />
        <StatCard
          title="المستثمرون"
          value={data.counts.companies}
          subtitle="إجمالي الشركات"
          color="purple"
        />
        <StatCard
          title="إجمالي الدخل"
          value={`${data.financials.totalIncome.toLocaleString('ar-SA')} د.أ`}
          subtitle={`${data.financials.incomeCount} حركة`}
          color="emerald"
        />
        <StatCard
          title="إجمالي المصاريف"
          value={`${data.financials.totalExpense.toLocaleString('ar-SA')} د.أ`}
          subtitle={`${data.financials.expenseCount} حركة`}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            صافي الرصيد
          </h2>
          <p
            className={`text-4xl font-bold ${
              data.financials.netBalance >= 0
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
          >
            {data.financials.netBalance.toLocaleString('ar-SA')} د.أ
          </p>
          <p className="text-sm text-gray-500 mt-2">
            الدخل - المصاريف = صافي الرصيد
          </p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            الدخل الشهري
          </h2>
          {data.charts.monthlyIncome.length > 0 ? (
            <div className="space-y-2">
              {data.charts.monthlyIncome.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{m.month}</span>
                  <span className="font-medium text-emerald-600">
                    {Number(m.total).toLocaleString('ar-SA')} د.أ
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">لا توجد بيانات بعد</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          آخر الحركات المالية
        </h2>
        {data.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-3 text-start font-medium">النوع</th>
                  <th className="pb-3 text-start font-medium">المبلغ</th>
                  <th className="pb-3 text-start font-medium">التاريخ</th>
                  <th className="pb-3 text-start font-medium">الحالة</th>
                  <th className="pb-3 text-start font-medium">الوصف</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-0">
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.type === 'income'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tx.type === 'expense'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {tx.type === 'income'
                          ? 'دخل'
                          : tx.type === 'expense'
                          ? 'مصاريف'
                          : tx.type}
                      </span>
                    </td>
                    <td className="py-3 font-medium">
                      {Number(tx.amount).toLocaleString('ar-SA')} د.أ
                    </td>
                    <td className="py-3 text-gray-600">{tx.date}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          tx.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'reversed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {tx.status === 'confirmed'
                          ? 'مؤكد'
                          : tx.status === 'reversed'
                          ? 'ملغي'
                          : 'معلق'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {tx.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">لا توجد حركات مالية بعد</p>
        )}
      </div>
    </div>
  );
}
