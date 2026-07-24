# VYPE Store Starter

متجر واجهة جاهز مبني بـ `Next.js + Vercel + Supabase` لطلبات:

- `VALORANT Points`
- `VALORANT gifting`

## ماذا يفعل هذا المشروع؟

- يعرض كتالوج عروض جاهز
- يحتوي على نموذج طلب فعلي
- يحفظ الطلبات في جدول `order_requests` داخل Supabase
- مناسب كبداية سريعة قبل إضافة الدفع أو لوحة إدارة

## ماذا ترفع إلى GitHub؟

ارفع **كل محتويات هذا المجلد** كما هي، باستثناء الملفات المستثناة في `.gitignore`.

## تشغيل محلي

```bash
npm install
npm run dev
```

## النشر على Vercel

1. ارفع المشروع إلى GitHub.
2. ادخل إلى Vercel.
3. اختر `New Project`.
4. اختر المستودع.
5. أضف:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. اضغط `Deploy`.

## إعداد Supabase

1. أنشئ مشروعًا جديدًا في Supabase.
2. افتح `SQL Editor`.
3. نفذ هذا الملف:

```text
supabase/setup.sql
```

4. خذ من إعدادات المشروع:
   - `Project URL`
   - `anon key`
5. أضف القيم إلى Vercel أو إلى `.env.local`.

## الجدول الذي ينشئه SQL

- `order_requests`

## أهم الملفات

- الصفحة الرئيسية: `app/page.js`
- التنسيق: `app/globals.css`
- نموذج الطلب: `components/order-form.js`
- خيارات المنتجات: `lib/catalog.js`
- قاعدة البيانات: `supabase/setup.sql`

## الخطوة التالية بعد النشر

إذا أردت النسخة الأقوى لاحقًا يمكننا إضافة:

- صفحة منتجات منفصلة
- لوحة Admin
- حالة الطلب `pending / paid / delivered`
- رفع إثباتات الدفع
- Stripe أو أي بوابة دفع أخرى
