# SB1 — حزمة التوسعة V3 المصححة

هذه الحزمة تجمع صفحات التوسعة مع ملفات components التي كانت ناقصة في الحزمة السابقة.

## المحتوى
- src/pages: لوحات الطالب والمدرس والإدارة، الرسائل، الإشعارات، الإعدادات، تفاصيل الكورس
- src/components: Footer.tsx, Navbar.tsx, BrandLogo.tsx
- src/lib: portalText.ts, featureText.ts

## مهم
1. اعمل فقط على فرع `selective-integration`.
2. لا تنسخ `App.tsx` من أي حزمة أخرى.
3. لا تستبدل `src/lib/supabase.ts`.
4. انسخ محتويات هذه الحزمة إلى جذر `Documents/github/sb1` مع الحفاظ على بنية المجلدات.
5. بعد النسخ نفّذ `npm run build`.
6. إذا نجح البناء فقط، اختبر الموقع محليًا قبل أي Commit/Push.
7. لا تشغّل أي SQL أو Migration في Supabase في هذه الحزمة.
