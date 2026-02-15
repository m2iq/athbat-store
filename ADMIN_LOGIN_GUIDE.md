# نظام تسجيل الدخول - لوحة التحكم

## تم إضافة نظام مصادقة كامل ✅

### الملفات المضافة:

1. **`admin/src/lib/auth.ts`** - خدمة المصادقة باستخدام Supabase Auth
2. **`admin/src/app/login/page.tsx`** - صفحة تسجيل الدخول
3. **`admin/src/components/auth-provider.tsx`** - حماية الصفحات وإدارة الجلسات

### الملفات المحدثة:

- **`admin/src/components/providers.tsx`** - إضافة AuthProvider
- **`admin/src/components/header.tsx`** - تحديث زر تسجيل الخروج

---

## كيفية إنشاء حساب مسؤول

### الطريقة 1: من خلال Supabase Dashboard (موصى بها)

1. افتح Supabase Dashboard
2. اذهب إلى **Authentication** → **Users**
3. اضغط على **Add user** → **Create new user**
4. أدخل:
   - Email: `admin@athbatstore.com` (أو أي بريد تريده)
   - Password: كلمة مرور قوية (6 أحرف على الأقل)
5. احفظ الحساب

### الطريقة 2: من خلال SQL Editor

قم بتنفيذ هذا الكود في **SQL Editor**:

```sql
-- إنشاء حساب مسؤول
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@athbatstore.com',
  crypt('admin123', gen_salt('bf')), -- كلمة المرور: admin123
  NOW(),
  '{"role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

⚠️ **مهم**: غيّر كلمة المرور `admin123` إلى كلمة مرور قوية!

---

## تسجيل الدخول

1. اذهب إلى: `http://localhost:3001/login`
2. أدخل البريد الإلكتروني وكلمة المرور
3. ستُحوّل تلقائياً إلى لوحة التحكم

---

## الحماية

✅ جميع صفحات `/dashboard/*` محمية تلقائياً
✅ إذا لم تكن مسجلاً، سيتم تحويلك إلى `/login`
✅ بعد تسجيل الدخول، لا يمكن الوصول إلى `/login` مرة أخرى

---

## تسجيل الخروج

اضغط على زر **"تسجيل الخروج"** في الهيدر (أعلى يسار الشاشة)
