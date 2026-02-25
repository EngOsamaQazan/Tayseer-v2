'use client';
import AuthLayout from '@/components/AuthLayout';
export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
