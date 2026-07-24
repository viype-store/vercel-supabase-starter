# VYPE Market Prototype

واجهة متجر `Next.js + Supabase` بطابع قريب من مواقع gaming marketplaces مثل:

- كثافة بصرية قوية
- تبويبات خدمات واضحة
- سلة و Checkout
- رفع وصل الدفع
- Tickets و Direct Chat

## ما الذي يوجد في هذه النسخة؟

- تسجيل دخول / إنشاء حساب عبر `Supabase Auth`
- 3 تبويبات رئيسية:
  - `شحن كلاعب طبيعي`
  - `شحن كـ Reseller`
  - `قيفت للبندل`
- إضافة المنتجات إلى السلة
- اختيار وسيلة الدفع:
  - `BaridiMob`
  - `CCP`
  - `Flexy`
- إضافة `+35%` فوق السعر الأساسي داخل checkout
- رفع وصل الدفع إلى `Supabase Storage`
- إنشاء الطلب داخل قاعدة البيانات
- إنشاء `ticket` أو `direct chat`
- عرض المحادثات والردود من داخل الموقع

## ملفات المشروع الأهم

- الصفحة الرئيسية: `app/page.js`
- الواجهة الكاملة: `components/storefront-app.js`
- بيانات المتجر والعروض: `lib/marketplace-data.js`
- عميل Supabase: `lib/supabase/client.js`
- قاعدة البيانات والتخزين: `supabase/setup.sql`
- التصميم: `app/globals.css`

## كيف تشغله محليًا؟

```bash
npm install
npm run dev
```

## متغيرات البيئة المطلوبة

أنشئ ملف `.env.local` أو أضفها في Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## ماذا تنفذ في Supabase؟

افتح `SQL Editor` ثم نفذ:

```text
supabase/setup.sql
```

هذا الملف ينشئ:

- `customer_profiles`
- `orders`
- `support_threads`
- `support_messages`
- bucket باسم `payment-receipts`

## ملاحظات مهمة

- إذا لم تكن متغيرات Supabase موجودة، الواجهة تعمل في `preview mode`
- الـ preview mode يسمح لك بمعاينة الشكل والتفاعل قبل تفعيل الـ backend
- عند تفعيل Supabase، الطلبات والتذاكر والرسائل تحفظ فعليًا

## الخطوات القادمة المنطقية

- لوحة Admin حقيقية للرد على الرسائل والطلبات
- حالة الطلب: `paid / in-progress / delivered / cancelled`
- إشعارات لحظية للرسائل
- صفحات منفصلة للمنتجات
- طرق دفع أكثر أو ربط بوابة تلقائية
