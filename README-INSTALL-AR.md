# حزمة إضافات SB1

هذه الحزمة تضيف مرحلة جديدة للمنصة بدون الحاجة إلى حزم npm جديدة.

## الملفات الرئيسية

- `src/App.tsx` — يضيف المسارات الجديدة.
- `src/components/Navbar.tsx` — اسم SB1 + قائمة «المزيد» متعددة اللغات.
- `src/components/Footer.tsx` — اسم SB1.
- `src/lib/featureText.ts` — نصوص الواجهة الجديدة.
- `src/pages/CommunityPage.tsx` — مجتمع/منشورات/غرف أقسام/مشاركة ملفات.
- `src/pages/ProfilePage.tsx` — ملف طالب/مستخدم.
- `src/pages/AcademyPage.tsx` — أكاديمية ومسارات من أسابيع إلى سنتين.
- `src/pages/SpecialtiesPage.tsx` — كتالوج التخصصات.
- `src/pages/ExamsPage.tsx` — امتحان تدريبي مع نتيجة فورية.
- `src/pages/AssistantsPage.tsx` — 3 أوضاع للمساعد الذكي: طالب/مدرس/إدارة.
- `src/pages/PaymentsPage.tsx` — واجهة الدفع لمرة واحدة، جاهزة للربط بمزودات الدفع لاحقًا.

## المسارات الجديدة

`/community`  `/profile`  `/academy`  `/specialties`  `/exams`  `/assistants`  `/payments`

## ملاحظة

الـPayments والـAI ومشاركة الملفات في هذه المرحلة هي واجهات وتجربة استخدام؛ لا تعتبر اتصالًا حقيقيًا بمزود دفع أو خدمة AI خارجية حتى يتم ربطها لاحقًا.

لا تُشغّل أي Migration أو تغييرات على Supabase بسبب هذه الحزمة.
