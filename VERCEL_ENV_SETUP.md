# Environment Variables للنشر على Vercel

يجب إضافة هذه المتغيرات في **Vercel Dashboard → Project Settings → Environment Variables**:

## المتغيرات المطلوبة:

### 1. NEXT_PUBLIC_SUPABASE_URL

```
https://your-project.supabase.co
```

احصل عليه من: Supabase Dashboard → Project Settings → API → Project URL

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

احصل عليه من: Supabase Dashboard → Project Settings → API → Project API keys → anon public

### 3. SUPABASE_SERVICE_ROLE_KEY (اختياري - للعمليات الإدارية)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

احصل عليه من: Supabase Dashboard → Project Settings → API → Project API keys → service_role secret

---

## كيفية إضافتها على Vercel:

1. اذهب إلى: https://vercel.com/dashboard
2. اختر مشروع `athbat-store`
3. **Settings** → **Environment Variables**
4. أضف المتغيرات الثلاثة أعلاه
5. اختر **Production**, **Preview**, و **Development**
6. اضغط **Save**
7. **Redeploy** المشروع

---

## ملاحظات مهمة:

⚠️ **لا تشارك `SUPABASE_SERVICE_ROLE_KEY` أو تضعها في الكود**

✅ المتغيرات التي تبدأ بـ `NEXT_PUBLIC_` تكون متاحة في Client-side

✅ باقي المتغيرات تبقى في Server-side فقط
