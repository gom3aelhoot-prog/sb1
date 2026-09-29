import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Star,
  Stethoscope,
  FlaskConical,
  Scan,
  HeartPulse,
  Accessibility,
  Pill,
  ChevronDown,
  Calendar,
  Home,
  FileText,
  Clock,
  Check,
  Building2,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/i18n/AppContext';

type FacilityCategory = 'clinics' | 'labs' | 'radiology' | 'rehab' | 'elderly' | 'pharmacies';

interface Facility {
  id: string;
  name: string;
  image: string;
  type: string;
  city: string;
  district: string;
  rating: number;
  ratingCount: number;
  available: boolean;
  nearestSlot?: string;
  homeVisit?: boolean;
  resultTime?: string;
  category: FacilityCategory;
  deliveryTime?: string;
}

const FACILITIES: Facility[] = [
  { id: 'c1', name: 'مجمع الشفاء الطبي', image: 'https://images.pexels.com/photos/5619462/pexels-photo-5619462.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'مستشفى خاص', city: 'الرياض', district: 'حي العليا', rating: 4.8, ratingCount: 1240, available: true, nearestSlot: 'غداً 10:00 ص', category: 'clinics' },
  { id: 'c2', name: 'مركز الحياة الطبي', image: 'https://images.pexels.com/photos/5827294/pexels-photo-5827294.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'عيادات متعددة', city: 'جدة', district: 'حي الروضة', rating: 4.6, ratingCount: 890, available: true, nearestSlot: 'اليوم 2:30 م', category: 'clinics' },
  { id: 'c3', name: 'مجمع النور الصحي', image: 'https://images.pexels.com/photos/7789616/pexels-photo-7789616.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'عيادة خاصة', city: 'الدمام', district: 'حي الشاطئ', rating: 4.9, ratingCount: 2100, available: true, nearestSlot: 'غداً 8:00 ص', category: 'clinics' },
  { id: 'c4', name: 'مستشفى المملكة', image: 'https://images.pexels.com/photos/5619462/pexels-photo-5619462.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'مستشفى جامعي', city: 'الرياض', district: 'حي الملقا', rating: 4.7, ratingCount: 3400, available: true, nearestSlot: 'اليوم 4:00 م', category: 'clinics' },
  { id: 'l1', name: 'مختبر البرج المخبري', image: 'https://images.pexels.com/photos/6627687/pexels-photo-6627687.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'مختبر تحاليل', city: 'الرياض', district: 'حي العليا', rating: 4.5, ratingCount: 670, available: true, homeVisit: true, resultTime: '6-12 ساعة', category: 'labs' },
  { id: 'l2', name: 'مختبر الدقة المخبري', image: 'https://images.pexels.com/photos/9629693/pexels-photo-9629693.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'مختبر تحاليل', city: 'جدة', district: 'حي النزهة', rating: 4.7, ratingCount: 540, available: true, homeVisit: true, resultTime: '4-8 ساعات', category: 'labs' },
  { id: 'l3', name: 'مختبر الأمانة', image: 'https://images.pexels.com/photos/6629398/pexels-photo-6629398.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'مختبر تحاليل', city: 'مكة', district: 'حي العزيزية', rating: 4.3, ratingCount: 320, available: true, homeVisit: false, resultTime: '12-24 ساعة', category: 'labs' },
  { id: 'r1', name: 'مركز الأشعة المتقدم', image: 'https://images.pexels.com/photos/13176356/pexels-photo-13176356.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'مركز أشعة', city: 'الرياض', district: 'حي السليمانية', rating: 4.6, ratingCount: 450, available: true, resultTime: '2-6 ساعات', category: 'radiology' },
  { id: 'r2', name: 'مركز التصوير الطبي', image: 'https://images.pexels.com/photos/7089017/pexels-photo-7089017.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'مركز أشعة وMRI', city: 'جدة', district: 'حي الروضة', rating: 4.8, ratingCount: 380, available: true, resultTime: '1-3 ساعات', category: 'radiology' },
  { id: 'p1', name: 'صيدلية النهدي', image: 'https://images.pexels.com/photos/14797864/pexels-photo-14797864.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'صيدلية', city: 'الرياض', district: 'حي العليا', rating: 4.4, ratingCount: 890, available: true, deliveryTime: '30-45 دقيقة', category: 'pharmacies' },
  { id: 'p2', name: 'صيدلية الأدوية الحديثة', image: 'https://images.pexels.com/photos/8657373/pexels-photo-8657373.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', type: 'صيدلية', city: 'جدة', district: 'حي الروضة', rating: 4.2, ratingCount: 230, available: true, deliveryTime: '30-45 دقيقة', category: 'pharmacies' },
];

const CATEGORY_CONFIG: { key: FacilityCategory; icon: LucideIcon }[] = [
  { key: 'clinics', icon: Stethoscope },
  { key: 'labs', icon: FlaskConical },
  { key: 'radiology', icon: Scan },
  { key: 'rehab', icon: HeartPulse },
  { key: 'elderly', icon: Accessibility },
  { key: 'pharmacies', icon: Pill },
];

const COMING_SOON_CATEGORIES: FacilityCategory[] = ['rehab', 'elderly'];

function renderStars(rating: number): React.ReactNode {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
          }`}
        />
      ))}
    </div>
  );
}

export function FacilitiesPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { t } = useApp();
  const [activeCategory, setActiveCategory] = useState<FacilityCategory>('clinics');
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [minRating, setMinRating] = useState('0');

  const isComingSoon = COMING_SOON_CATEGORIES.includes(activeCategory);

  const filtered = useMemo(() => {
    let list = FACILITIES.filter((f) => f.category === activeCategory);
    if (searchName.trim()) {
      list = list.filter((f) => f.name.toLowerCase().includes(searchName.toLowerCase()));
    }
    if (searchLocation.trim()) {
      const q = searchLocation.toLowerCase();
      list = list.filter((f) => f.city.toLowerCase().includes(q) || f.district.toLowerCase().includes(q));
    }
    if (filterType !== 'all') {
      list = list.filter((f) => f.type.includes(filterType));
    }
    if (minRating !== '0') {
      list = list.filter((f) => f.rating >= parseFloat(minRating));
    }
    return list.sort((a, b) => b.rating - a.rating);
  }, [activeCategory, searchName, searchLocation, filterType, minRating]);

  const availableTypes = useMemo(() => {
    const types = new Set(FACILITIES.filter((f) => f.category === activeCategory).map((f) => f.type));
    return Array.from(types);
  }, [activeCategory]);

  const clearFilters = () => {
    setSearchName('');
    setSearchLocation('');
    setFilterType('all');
    setMinRating('0');
  };

  const isLabCategory = activeCategory === 'labs' || activeCategory === 'radiology';

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-10 lg:py-14">
        <div className="container-x">
          <h1 className="text-2xl lg:text-3xl font-bold">{t.facilities.title}</h1>
          <p className="mt-2 text-primary-100 text-sm lg:text-base">{t.facilities.subtitle}</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-neutral-200 sticky top-16 lg:top-20 z-30">
        <div className="container-x">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin py-3 -mx-1 px-1">
            {CATEGORY_CONFIG.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); clearFilters(); }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.facilities[cat.key]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-x py-6 lg:py-8">
        {/* Advanced search bar */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 lg:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Name search */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">{t.facilities.searchName}</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder={t.facilities.searchNamePlaceholder}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 ps-9 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                />
                <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {/* Location search */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">{t.facilities.searchLocation}</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder={t.facilities.searchLocationPlaceholder}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 ps-9 pe-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                />
                <MapPin className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {/* Type filter */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">{t.facilities.filterType}</label>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 ps-3 pe-9 text-sm text-neutral-900 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                >
                  <option value="all">{t.facilities.allTypes}</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {/* Min rating */}
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wide">{t.facilities.minRating}</label>
              <div className="relative">
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 ps-3 pe-9 text-sm text-neutral-900 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
                >
                  <option value="0">{t.facilities.anyRating}</option>
                  <option value="3">3+ ★</option>
                  <option value="4">4+ ★</option>
                  <option value="4.5">4.5+ ★</option>
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>

            {/* Clear button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                {t.facilities.clearFilters}
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        {isComingSoon ? (
          <div className="flex flex-col items-center justify-center py-16 lg:py-24 bg-white rounded-2xl border border-neutral-200">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 mb-5">
              <AlertCircle className="h-10 w-10 text-neutral-300" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">{t.facilities.comingSoon}</h3>
            <p className="mt-2 text-sm text-neutral-500 text-center max-w-md leading-relaxed">{t.facilities.comingSoonDesc}</p>
            <button
              onClick={() => onNavigate('facility-registration')}
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
            >
              <Building2 className="h-5 w-5" />
              {t.facilities.registerFacility}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-neutral-200">
            <Search className="h-10 w-10 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-400">{t.facilities.noResults}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-500 mb-4">
              <span className="font-bold text-neutral-900">{filtered.length}</span> {t.facilities.results}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {filtered.map((f) => (
                <div
                  key={f.id}
                  className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-200"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={f.image}
                      alt={f.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {f.available && (
                      <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        {t.facilities.available}
                      </span>
                    )}
                    {f.homeVisit && (
                      <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                        <Home className="h-3 w-3" />
                        {t.facilities.homeVisit}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    {/* Name + type */}
                    <h3 className="font-bold text-neutral-900 text-base truncate">{f.name}</h3>
                    <p className="mt-0.5 text-sm text-primary-600 font-medium">{f.type}</p>

                    {/* Location */}
                    <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{f.city} - {f.district}</span>
                    </div>

                    {/* Rating */}
                    <div className="mt-2.5 flex items-center gap-2">
                      {renderStars(f.rating)}
                      <span className="text-xs font-bold text-neutral-700">{f.rating.toFixed(1)}</span>
                      <span className="text-xs text-neutral-400">({f.ratingCount.toLocaleString()} {t.facilities.ratingsCount})</span>
                    </div>

                    {/* Lab/radiology: result time */}
                    {isLabCategory && f.resultTime && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">
                          {t.facilities.resultTime}: {f.resultTime}
                        </span>
                      </div>
                    )}

                    {/* Clinic: nearest appointment */}
                    {!isLabCategory && activeCategory === 'clinics' && f.nearestSlot && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary-50 border border-primary-100 px-3 py-2">
                        <Calendar className="h-4 w-4 text-primary-600" />
                        <span className="text-xs font-semibold text-primary-700">
                          {t.facilities.nearestAppointment}: {f.nearestSlot}
                        </span>
                      </div>
                    )}

                    {/* Pharmacy: delivery time */}
                    {activeCategory === 'pharmacies' && f.deliveryTime && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">
                          {t.pharmacyStore.deliveryTime}: {f.deliveryTime}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          if (activeCategory === 'pharmacies') onNavigate(`pharmacy-store?id=${f.id}`);
                        }}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                          isLabCategory
                            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/20'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {activeCategory === 'pharmacies' ? t.pharmacyStore.browseProducts : isLabCategory ? t.facilities.bookTest : t.facilities.bookAppointment}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          if (activeCategory === 'pharmacies') onNavigate(`pharmacy-store?id=${f.id}`);
                        }}
                        className="flex-1 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-bold text-neutral-700 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <FileText className="h-4 w-4" />
                          {activeCategory === 'pharmacies' ? t.pharmacyStore.mostOrdered : isLabCategory ? t.facilities.testList : t.facilities.moreDetails}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Register facility banner */}
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-neutral-100 to-primary-50/50 border border-neutral-200 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 ring-1 ring-primary-200">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-neutral-900">{t.facilities.registerFacility}</h3>
                  <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{t.facilities.comingSoonDesc}</p>
                </div>
                <button
                  onClick={() => onNavigate('facility-registration')}
                  className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-all hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
                >
                  <Building2 className="h-5 w-5" />
                  {t.facilities.registerFacility}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
