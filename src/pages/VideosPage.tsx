import { useEffect, useState } from 'react';
import { Play, Eye, Clock, Video } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useI18n } from '@/lib/i18n';
import { supabase, type DoctorVideo, type Specialty, type Doctor } from '@/lib/supabase';
import { demoVideos, demoSpecialties } from '@/lib/demoData';

export default function VideosPage() {
  const { navigate } = useRouter();
  const { t, specialtyName } = useI18n();
  const [videos, setVideos] = useState<DoctorVideo[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<DoctorVideo | null>(null);

  useEffect(() => {
    (async () => {
      const { data: specs } = await supabase.from('specialties').select('*').order('name');
      setSpecialties((specs && specs.length ? specs : demoSpecialties) as Specialty[]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let dbQuery = supabase.from('doctor_videos').select('*, doctor(*), specialty(*)');
      if (selectedSpecialty) {
        const { data: spec } = await supabase.from('specialties').select('id').eq('slug', selectedSpecialty).maybeSingle();
        if (spec) dbQuery = dbQuery.eq('specialty_id', spec.id);
      }
      const { data } = await dbQuery.order('created_at', { ascending: false });
      setVideos((data && data.length ? data : demoVideos) as DoctorVideo[]);
      setLoading(false);
    })().catch(() => { setVideos(demoVideos); setLoading(false); });
  }, [selectedSpecialty]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('videos.title')}</h1>
          <p className="text-gray-500">{t('videos.subtitle')}</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button onClick={() => setSelectedSpecialty('')} className={`badge transition-all ${!selectedSpecialty ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t('common.all')}
          </button>
          {specialties.map((spec) => (
            <button key={spec.id} onClick={() => setSelectedSpecialty(spec.slug)} className={`badge transition-all ${selectedSpecialty === spec.slug ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {spec.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-4"><div className="h-5 bg-gray-100 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <Video className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">{t('videos.no_videos')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <button key={vid.id} onClick={() => { setSelectedVideo(vid); supabase.from('doctor_videos').update({ views: (vid.views || 0) + 1 }).eq('id', vid.id); }} className="card card-hover overflow-hidden text-right group">
                <div className="relative h-48 bg-gradient-to-br from-teal-100 to-teal-50 overflow-hidden">
                  {vid.thumbnail_url ? (
                    <img src={vid.thumbnail_url} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-teal-600 mr-[-2px]" fill="currentColor" />
                    </div>
                  </div>
                  {vid.duration_seconds > 0 && (
                    <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{formatDuration(vid.duration_seconds)}</span>
                  )}
                  {vid.specialty && (
                    <span className="absolute top-3 right-3 badge bg-white/90 backdrop-blur text-teal-700 shadow-sm">{specialtyName(vid.specialty)}</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">{vid.title}</h3>
                  {vid.doctor && <p className="text-sm text-teal-600 mb-2">{vid.doctor.name}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{vid.views}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(vid.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-black aspect-video">
              <video src={selectedVideo.video_url} controls autoPlay className="w-full h-full" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-800">{selectedVideo.title}</h2>
                <button onClick={() => setSelectedVideo(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>
              {selectedVideo.doctor && <p className="text-teal-600 font-medium mb-2">{selectedVideo.doctor.name}</p>}
              {selectedVideo.description && <p className="text-gray-600 leading-relaxed">{selectedVideo.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
