'use client';
import AuthLayout from '@/components/AuthLayout';
export default function HrLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
