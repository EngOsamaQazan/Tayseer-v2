# AGENTS.md

## Project Overview

Tayseer ERP v2 - نظام تيسير لإدارة شركات التقسيط والإقراض (SaaS Multi-Tenant)

**Migrating from:** Yii2/PHP legacy system (154 tables) → NestJS + Next.js + PostgreSQL (~35 tables)
**Legacy system docs:** See `docs/SYSTEM_OVERVIEW.md` for complete reverse engineering
**DB restructure plan:** See `docs/DATABASE_RESTRUCTURE_PLAN.md` for migration rationale

## Architecture

```
SaaS Multi-Tenant (Single DB, shared schema, tenant_id column on EVERY table)
├── Backend:  NestJS + TypeScript + TypeORM + PostgreSQL
├── Frontend: Next.js + React (NOT YET BUILT)
├── Auth:     JWT + Passport (tenantId embedded in token)
├── API:      REST at /api/v1/ (GraphQL planned)
├── Docs:     Swagger at /api/docs
└── DB:       PostgreSQL (tayseer_db)
```

## Current State

### ✅ Completed Modules (16 modules, ~90 endpoints):

| # | Module | Table(s) | Endpoints | Description |
|---|--------|----------|-----------|-------------|
| 1 | **Tenants** | `tenants` | 4 | إدارة المستأجرين (SaaS) - UUID-based |
| 2 | **Auth** | - | 3 | تسجيل شركة + دخول + JWT with tenantId |
| 3 | **Users** | `users` | 5 | المستخدمون - RBAC roles, tenant-isolated |
| 4 | **Lookups** | `lookups` | 7 | 🆕 القوائم المرجعية الموحدة (بديل 15 جدول) |
| 5 | **Categories** | `categories` | 5 | 🆕 فئات الدخل والمصاريف الموحدة |
| 6 | **Companies** | `companies`, `company_banks` | 5 | المستثمرون مع حسابات بنكية |
| 7 | **Customers** | `customers`, `customer_addresses`, `customer_phones` | 7 | العملاء مع عناوين وهواتف |
| 8 | **Financial Transactions** | `financial_transactions` | 8 | 🆕 الحركات المالية الموحدة (بديل 3 جداول) |
| 9 | **Audit** | `audit_logs` | 3 | 🆕 سجل العمليات المركزي |
| 10 | **Contracts** | `contracts`, `contract_items`, `contract_installments`, `contract_parties` | 8 | 🆕 العقود مع أطراف وبنود وأقساط تلقائية، يستخدم lookups و financial_transactions |
| 11 | **Follow-Up** | `follow_ups` | 8 | 🆕 المتابعة مع تذكيرات ووعود بالدفع، يستخدم lookups (feeling, connection_response) |
| 12 | **Courts** | `courts` | 5 | 🆕 المحاكم مع ربط المدينة من lookups |
| 13 | **Lawyers** | `lawyers` | 5 | 🆕 المحامون |
| 14 | **Judiciary** | `judiciary_cases`, `judiciary_actions` | 10 | 🆕 القضايا والإجراءات القضائية، مربوط بالعقود والمحاكم والمحامين |
| 15 | **Collection** | `collections`, `collection_installments` | 8 | 🆕 التحصيل مع أقساط شهرية، مربوط بالعقود والقضايا |

### ✅ تم حل التنبيهات السابقة:

1. **~~موديول Income~~** - لم يكن موجوداً كرمز منفصل. الدفعات مدمجة في `financial_transactions` بـ `type='income'`.
2. **~~موديول Contracts يحتاج تحديث~~** - تم بناؤه من جديد ليستخدم `lookups` للحقول المرجعية و `financial_transactions` للدفعات.
3. **موديول Financial Transactions** - النسخة الموحدة (income/expense/transfer/bank_import) هي المعتمدة.

### ❌ لم يُبنى بعد (بالترتيب المطلوب):

| الأولوية | Module | الوصف | الجداول المقترحة |
|----------|--------|-------|-----------------|
| 1 | **HR** | الموارد البشرية | `employees`, `attendance`, `payroll_runs`, `leave_requests`, `field_sessions` |
| 2 | **Inventory** | المخزون | `inventory_items`, `inventory_movements`, `suppliers`, `purchase_orders` |
| 3 | **Notifications** | الإشعارات | `notifications` |
| 4 | **SMS** | الرسائل | `sms_messages` |
| 5 | **Reports** | التقارير | لا جداول (queries على الجداول الموجودة) |
| 6 | **Dashboard** | لوحة التحكم | لا جداول (aggregation queries) |
| 7 | **System Settings** | إعدادات النظام | `system_settings` |
| 8 | **Jobs** | أماكن العمل | `jobs` |
| 9 | **Next.js Frontend** | الواجهة الأمامية | - |

## Database Design (Restructured)

### Key Design: من 154 جدول → ~35 جدول

| التحسين | التفصيل |
|---------|---------|
| **lookups table** | جدول واحد يستبدل 15 جدول lookup (city, bank, status, citizen, feeling, contact_type, etc.). استخدم `type` column للتمييز |
| **categories table** | جدول واحد بـ `type='income'\|'expense'` يستبدل expense_categories + income_category |
| **financial_transactions** | جدول واحد بـ `type='income'\|'expense'\|'transfer'\|'bank_import'` يستبدل 3 جداول (income + expenses + financial_transaction) |
| **audit_logs** | جدول مركزي لتتبع كل العمليات بدل تتبع متفرق |
| **JSONB** | استخدام JSONB للبيانات المرنة في HR بدل جداول منفصلة |

### Seed Data

عند إنشاء tenant جديد، يمكن استدعاء:
- `POST /api/v1/lookups/seed` → ينشئ 66 قيمة افتراضية (مدن، بنوك، جنسيات، إلخ)
- `POST /api/v1/categories/seed` → ينشئ 12 فئة افتراضية (5 دخل + 7 مصاريف)

### Entity Pattern

كل Entity يجب أن يحتوي:
```typescript
@Column({ type: 'uuid' })
@Index()
tenantId: string;

@ManyToOne(() => Tenant)
@JoinColumn({ name: 'tenantId' })
tenant: Tenant;
```

كل Service يجب أن يفلتر بـ:
```typescript
where: { tenantId, isDeleted: false }
```

## Key Design Decisions

- **Multi-Tenant:** Single DB, shared schema. `tenantId: uuid` on every table. All queries MUST filter by tenantId.
- **Soft Delete:** `isDeleted: boolean` on every entity. Never hard delete.
- **Unified Lookups:** One `lookups` table with `type` column replaces 15+ separate tables.
- **Unified Financials:** One `financial_transactions` table with `type` enum replaces income + expenses + financial_transaction.
- **Validation:** class-validator + class-transformer with global ValidationPipe (whitelist + transform).
- **API Prefix:** All routes under `/api/v1/`.
- **Swagger:** Auto-generated at `/api/docs` with Arabic labels.
- **Audit:** Global `AuditModule` available in all modules via `@Global()`.

## Cursor Cloud specific instructions

### Running the API
```bash
cd api
pnpm install
sudo pg_ctlcluster 16 main start
sudo -u postgres psql -c "CREATE USER tayseer WITH PASSWORD 'Tayseer@2026' CREATEDB;" 2>/dev/null
sudo -u postgres psql -c "CREATE DATABASE tayseer_db OWNER tayseer;" 2>/dev/null
pnpm run start:dev
```

### Environment Variables
Create `api/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tayseer
DB_PASSWORD=Tayseer@2026
DB_NAME=tayseer_db
JWT_SECRET=tayseer-jwt-secret-key-change-in-production
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=development
```

### Testing API
```bash
# Register (creates tenant + admin)
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" \
  -d '{"companyName":"Test","companySlug":"test","username":"admin","email":"admin@test.co","password":"admin123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}'

# Seed lookups (after login, use token)
curl -X POST http://localhost:3000/api/v1/lookups/seed -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:3000/api/v1/categories/seed -H "Authorization: Bearer TOKEN"
```

### Module Creation Pattern
1. Entity in `src/modules/{name}/entities/` → must have `tenantId: uuid` + `isDeleted: boolean`
2. DTO in `src/modules/{name}/dto/` → class-validator decorators + @ApiProperty
3. Service in `src/modules/{name}/` → ALL queries filter by tenantId
4. Controller in `src/modules/{name}/` → extract tenantId from `req.user.tenantId`
5. Module file → register in `app.module.ts`
6. Use `lookups` table for reference data instead of creating new tables
7. Use `financial_transactions` for any money movement instead of separate tables

## Reference Documents

| File | Content |
|------|---------|
| `docs/SYSTEM_OVERVIEW.md` | Full legacy system reverse engineering (80+ modules, 154 tables, workflows) |
| `docs/DATABASE_RESTRUCTURE_PLAN.md` | Detailed plan for 154→35 table restructure with SQL schemas |
| `docs/db_columns_full.txt` | All 1,800 columns from legacy DB |
| `docs/db_indexes.txt` | All 440 legacy DB indexes |
| `docs/HR_MODULE_SPECIFICATION.md` | Detailed HR module specification |
| `docs/invoice-wizard-and-approval-flow.md` | Invoice workflow documentation |
