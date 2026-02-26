'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  category: string;
  label: string;
  valueType: string;
}

const categoryLabels: Record<string, string> = {
  general: 'عام',
  financial: 'مالي',
  contracts: 'العقود',
  notifications: 'الإشعارات',
  display: 'العرض',
};

const categories = ['general', 'financial', 'contracts', 'notifications', 'display'];

const inputClass =
  'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<SystemSetting[]>(
        `/system-settings?category=${activeCategory}`,
      );
      setSettings(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEdit = (setting: SystemSetting) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
  };

  const saveEdit = async (setting: SystemSetting) => {
    setSaving(true);
    try {
      await api.post('/system-settings/upsert', {
        key: setting.key,
        value: editValue,
        category: setting.category,
        label: setting.label,
        valueType: setting.valueType,
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حفظ الإعداد');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, setting: SystemSetting) => {
    if (e.key === 'Enter') {
      saveEdit(setting);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const toggleBoolean = async (setting: SystemSetting) => {
    const newValue = setting.value === 'true' ? 'false' : 'true';
    try {
      await api.post('/system-settings/upsert', {
        key: setting.key,
        value: newValue,
        category: setting.category,
        label: setting.label,
        valueType: setting.valueType,
      });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحديث الإعداد');
    }
  };

  const seedDefaults = async () => {
    setSeeding(true);
    setError('');
    try {
      await api.post('/system-settings/seed');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل الإعدادات الافتراضية');
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعداد؟')) return;
    try {
      await api.delete(`/system-settings/${id}`);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إعدادات النظام</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            + إضافة إعداد
          </button>
          <button
            onClick={seedDefaults}
            disabled={seeding}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {seeding ? 'جاري التحميل...' : 'تحميل الإعدادات الافتراضية'}
          </button>
        </div>
      </div>

      {showAdd && (
        <AddSettingForm
          category={activeCategory}
          onSuccess={() => {
            setShowAdd(false);
            fetchData();
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">
            جاري التحميل...
          </div>
        ) : settings.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            لا توجد إعدادات في هذا التصنيف
          </div>
        ) : (
          <div className="divide-y">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {setting.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{setting.key}</p>
                </div>

                <div className="flex items-center gap-4">
                  {setting.valueType === 'boolean' ? (
                    <button
                      onClick={() => toggleBoolean(setting)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        setting.value === 'true'
                          ? 'bg-emerald-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          setting.value === 'true'
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : editingId === setting.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type={setting.valueType === 'number' ? 'number' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, setting)}
                        onBlur={() => saveEdit(setting)}
                        autoFocus
                        className="w-48 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      {saving && (
                        <span className="text-xs text-gray-400">
                          جاري الحفظ...
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(setting)}
                      className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors min-w-[120px] text-start"
                    >
                      {setting.value || '-'}
                    </button>
                  )}

                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {setting.valueType}
                  </span>

                  <button
                    onClick={() => handleDelete(setting.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddSettingForm({
  category,
  onSuccess,
  onCancel,
}: {
  category: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    key: '',
    value: '',
    category,
    label: '',
    valueType: 'string',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/system-settings/upsert', form);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إضافة الإعداد');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 mb-4">
      <h2 className="text-lg font-semibold mb-4">إضافة إعداد جديد</h2>
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
            المفتاح *
          </label>
          <input
            required
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
            className={inputClass}
            placeholder="setting_key"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التسمية *
          </label>
          <input
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className={inputClass}
            placeholder="اسم الإعداد بالعربي"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            القيمة *
          </label>
          <input
            required
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التصنيف
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع القيمة
          </label>
          <select
            value={form.valueType}
            onChange={(e) => setForm({ ...form, valueType: e.target.value })}
            className={inputClass}
          >
            <option value="string">نص</option>
            <option value="number">رقم</option>
            <option value="boolean">نعم/لا</option>
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
