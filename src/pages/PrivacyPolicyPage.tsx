import { Shield, Lock, Database, Share2, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100">
              <Shield className="h-8 w-8 text-teal-700" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">سياسة الخصوصية</h1>
            <p className="mt-2 text-sm text-slate-500">SB1 — آخر تحديث: 2 أكتوبر 2026</p>
          </div>

          <div className="space-y-7 text-sm leading-7 text-slate-700">
            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">1. مقدمة</h2>
              <p>
                تحترم منصة SB1 خصوصية مستخدميها. توضح هذه السياسة أنواع المعلومات التي قد تتم معالجتها
                عند استخدام خدمات SB1، بما في ذلك الميزات التي يختار المستخدم ربطها بخدمات خارجية مثل
                Pinterest، وكيفية استخدام هذه المعلومات لتقديم الميزات المطلوبة.
              </p>
            </section>

            <section>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Database className="h-5 w-5 text-teal-700" />
                2. المعلومات التي قد نعالجها
              </h2>
              <p>
                قد تشمل المعلومات التي يقدمها المستخدم مباشرة معلومات الحساب والملف الشخصي والمحتوى
                الذي ينشئه أو يرفعه، ومعلومات مرتبطة بالميزات التي يفعّلها المستخدم. وقد نتلقى من
                الخدمات الخارجية، عند منح المستخدم الإذن، المعلومات اللازمة لتقديم التكامل المطلوب.
              </p>
            </section>

            <section>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Share2 className="h-5 w-5 text-teal-700" />
                3. تكامل Pinterest
              </h2>
              <p>
                إذا اختار المستخدم ربط حساب Pinterest مع SB1، يتم استخدام صلاحيات OAuth التي يوافق
                عليها المستخدم لتقديم ميزات التكامل المطلوبة، مثل الوصول إلى معلومات الحساب أو Pins
                وBoards الخاصة بالمستخدم أو نشر المحتوى عندما تكون الصلاحيات المطلوبة متاحة ومصرحًا بها.
                لا نطلب بيانات Pinterest لمستخدمين آخرين إلا إذا كانت هناك صلاحية مناسبة ومبرر واضح
                لهذه الوظيفة.
              </p>
            </section>

            <section>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Lock className="h-5 w-5 text-teal-700" />
                4. استخدام المعلومات وحمايتها
              </h2>
              <p>
                نستخدم المعلومات لتشغيل SB1 وتقديم الميزات التي يطلبها المستخدم وتحسين تجربة الاستخدام
                وحماية المنصة. نتخذ إجراءات تقنية وتنظيمية مناسبة لحماية المعلومات من الوصول غير
                المصرح به أو الاستخدام أو التغيير أو الإفصاح غير المصرح به.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">5. مشاركة المعلومات</h2>
              <p>
                لا نستخدم معلومات التكامل مع الخدمات الخارجية إلا بالقدر اللازم لتقديم الميزات التي
                يطلبها المستخدم، أو عندما يكون ذلك مطلوبًا قانونًا. لا نبيع المعلومات الشخصية للمستخدمين.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">6. الاحتفاظ بالبيانات وإلغاء الربط</h2>
              <p>
                نحتفظ بالمعلومات فقط للمدة اللازمة للأغراض المشروعة المرتبطة بالخدمة أو وفقًا للمتطلبات
                القانونية. يمكن للمستخدم طلب إيقاف تكامل خدمة خارجية وإلغاء الصلاحيات الممنوحة لها.
                وقد يؤدي إلغاء الصلاحيات إلى توقف بعض ميزات التكامل.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">7. خدمات الطرف الثالث</h2>
              <p>
                عند استخدام تكامل مع خدمة خارجية، تخضع معالجة البيانات لدى تلك الخدمة لسياسة الخصوصية
                والشروط الخاصة بها. يُنصح المستخدم بمراجعة سياسات الخدمة الخارجية التي يختار ربطها بحسابه.
              </p>
            </section>

            <section>
              <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Mail className="h-5 w-5 text-teal-700" />
                8. التواصل
              </h2>
              <p>
                للاستفسارات المتعلقة بالخصوصية أو طلبات البيانات، يمكن للمستخدم استخدام قنوات الدعم
                والتواصل المتاحة داخل منصة SB1.
              </p>
            </section>

            <section className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              هذه السياسة مخصصة لتوضيح ممارسات الخصوصية في SB1. يجب على مالك المنصة مراجعتها وتحديثها
              إذا تغيرت طريقة جمع البيانات أو تخزينها أو مشاركتها، كما ينبغي التأكد من توافقها مع
              المتطلبات القانونية المطبقة على المنصة.
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
