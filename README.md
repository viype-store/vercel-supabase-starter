# Vercel + Supabase Starter

قالب جاهز ترفعه إلى GitHub ثم تربطه مع Vercel و Supabase.

## ماذا ترفع إلى GitHub؟

ارفع **كل محتويات هذا المجلد** كما هي، ما عدا الملفات الموجودة أصلًا في `.gitignore`.

## التشغيل المحلي

```bash
npm install
npm run dev
```

## الربط مع Vercel

1. ارفع هذا المجلد إلى مستودع جديد في GitHub.
2. ادخل إلى Vercel ثم اختر `New Project`.
3. اختر المستودع الذي رفعت إليه هذا القالب.
4. أضف متغيرات البيئة التالية في إعدادات المشروع:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. اضغط `Deploy`.

## الربط مع Supabase

1. أنشئ مشروعًا جديدًا في Supabase.
2. افتح `SQL Editor`.
3. نفذ الملف التالي:

```text
supabase/setup.sql
```

4. من إعدادات المشروع خذ:
   - `Project URL`
   - `anon key`
5. ضع القيمتين في Vercel أو في `.env.local` محليًا.

## أين تعدل المحتوى؟

- النصوص الرئيسية: `app/page.js`
- الألوان والتصميم: `app/globals.css`
- نموذج Supabase: `components/waitlist-form.js`

## فكرة القالب

هذا القالب عبارة عن صفحة هبوط حديثة فيها:

- واجهة جاهزة للنشر على Vercel
- نموذج بسيط يحفظ البريد والاسم والفكرة في Supabase
- تصميم قابل للتعديل بسرعة
