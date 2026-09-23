import { HeartPulse, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

export function Footer() {
  const { t } = useApp();

  const patientLinks = [
    { label: t.footer.findDoctor, href: '#' },
    { label: t.footer.bookAppointment, href: '#' },
    { label: t.footer.pricing, href: '#' },
    { label: t.footer.faq, href: '#' },
  ];

  const doctorLinks = [
    { label: t.footer.joinAsDoctor, href: '#' },
    { label: t.footer.doctorGuide, href: '#' },
    { label: t.footer.about, href: '#' },
    { label: t.footer.blog, href: '#' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-lg font-bold leading-tight text-white">SB1</span>
                <span className="block text-[10px] font-medium leading-tight text-primary-400">Online</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400 max-w-sm">{t.footer.aboutDesc}</p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">{t.footer.newsletter}</p>
              <p className="mt-1 text-xs text-neutral-400">{t.footer.newsletterDesc}</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  placeholder={t.footer.emailPlaceholder}
                  className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none"
                />
                <button
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition-all hover:bg-primary-700 active:scale-95"
                  onClick={(e) => e.preventDefault()}
                  aria-label={t.footer.subscribe}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">{t.footer.quickLinks}</h3>
            <ul className="mt-4 space-y-2.5">
              {patientLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-neutral-400 transition-colors hover:text-primary-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For doctors */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">{t.footer.forDoctors}</h3>
            <ul className="mt-4 space-y-2.5">
              {doctorLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    onClick={(e) => e.preventDefault()}
                    className="text-sm text-neutral-400 transition-colors hover:text-primary-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">{t.footer.contactUs}</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-sm text-neutral-400">
                <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
                support@sb1.com
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400">
                <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
                —
              </li>
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <MapPin className="h-4 w-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>SB1</span>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">{t.footer.followUs}</p>
              <div className="mt-3 flex gap-2">
                {socialLinks.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    onClick={(e) => e.preventDefault()}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 transition-all hover:bg-primary-600 hover:text-white"
                    aria-label={t.footer.followUs}
                  >
                    <social.icon className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-neutral-800 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-500">
              © {new Date().getFullYear()} {t.footer.about}. {t.footer.rights}.
            </p>
            <div className="flex gap-5">
              <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-neutral-500 hover:text-primary-400 transition-colors">{t.footer.privacy}</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-neutral-500 hover:text-primary-400 transition-colors">{t.footer.terms}</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-neutral-500 hover:text-primary-400 transition-colors">{t.footer.cookies}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
