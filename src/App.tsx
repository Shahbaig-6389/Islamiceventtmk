import { useEffect, useState } from 'react';
import { DEFAULT_EVENT_DATA } from './data/defaultEvent';
import { EventData, RsvpEntry } from './types/event';
import { generateIcsCalendar } from './utils/exportHtml';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SpeakerSection } from './components/SpeakerSection';
import { ScheduleSection } from './components/ScheduleSection';
import { LiveStreamSection } from './components/LiveStreamSection';
import { PublicityRsvpSection } from './components/PublicityRsvpSection';
import { PosterModal } from './components/PosterModal';
import { OrganizerDrawer, OrganizerTab } from './components/OrganizerDrawer';

const EVENT_STORAGE_KEY = 'jalsa_islah_2026_event_v1';
const RSVP_STORAGE_KEY = 'jalsa_islah_2026_rsvps_v1';

export default function App() {
  const [eventData, setEventData] = useState<EventData>(() => {
    try {
      const saved = localStorage.getItem(EVENT_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_EVENT_DATA, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback cleanly to default data
    }
    return DEFAULT_EVENT_DATA;
  });

  const [rsvps, setRsvps] = useState<RsvpEntry[]>(() => {
    try {
      const saved = localStorage.getItem(RSVP_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage parse failure
    }
    return [];
  });

  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [organizerOpen, setOrganizerOpen] = useState(false);
  const [organizerTab, setOrganizerTab] = useState<OrganizerTab>('general');

  useEffect(() => {
    try {
      localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(eventData));
    } catch {
      // Ignore quota errors
    }
  }, [eventData]);

  useEffect(() => {
    try {
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(rsvps));
    } catch {
      // Ignore quota errors
    }
  }, [rsvps]);

  const handleDownloadCalendar = () => {
    const ics = generateIcsCalendar(eventData);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Jalsa-Islah-e-Moashara-11-Dec-2026.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateYouTube = (youtubeUrl: string, isLiveActive: boolean) => {
    setEventData((prev) => ({
      ...prev,
      youtubeUrl,
      isLiveActive,
    }));
  };

  const handleAddRsvp = (entry: Omit<RsvpEntry, 'id' | 'createdAt'>) => {
    const next: RsvpEntry = {
      ...entry,
      id: `rsvp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRsvps((prev) => [next, ...prev]);
  };

  const handleResetDefaults = () => {
    setEventData(DEFAULT_EVENT_DATA);
    localStorage.removeItem(EVENT_STORAGE_KEY);
  };

  const openOrganizer = (tab: OrganizerTab) => {
    setOrganizerTab(tab);
    setOrganizerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#111C17]">
      <Header
        organizationName={eventData.organizationName}
        onOpenManage={() => openOrganizer('export')}
      />

      <main className="flex-1">
        <HeroSection
          event={eventData}
          onOpenPoster={() => setPosterModalOpen(true)}
          onDownloadCalendar={handleDownloadCalendar}
        />

        <SpeakerSection speaker={eventData.speaker} />

        <ScheduleSection
          eventDateDisplay={eventData.eventDateDisplay}
          schedule={eventData.schedule}
          onDownloadCalendar={handleDownloadCalendar}
          onOpenScheduleEditor={() => openOrganizer('schedule')}
        />

        <LiveStreamSection
          youtubeUrl={eventData.youtubeUrl}
          isLiveActive={eventData.isLiveActive}
          liveStreamNote={eventData.liveStreamNote}
          eventDateDisplay={eventData.eventDateDisplay}
          onUpdateYouTube={handleUpdateYouTube}
        />

        <PublicityRsvpSection
          event={eventData}
          rsvps={rsvps}
          onAddRsvp={handleAddRsvp}
        />
      </main>

      <footer className="bg-[#063B2B] text-[#D7E6DF] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <p className="font-serif text-lg font-bold text-white">{eventData.organizationName}</p>
            <p className="text-xs text-[#B6CEC2]">
              {eventData.venueName}, {eventData.venueAddress} · {eventData.entryNote}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <a href="#speaker" className="hover:text-white transition-colors">
              Speaker
            </a>
            <a href="#schedule" className="hover:text-white transition-colors">
              Schedule
            </a>
            <a href="#live" className="hover:text-white transition-colors">
              Live Stream
            </a>
            <button
              type="button"
              onClick={() => openOrganizer('export')}
              className="text-[#C2DC62] hover:underline cursor-pointer"
            >
              Export GitHub index.html
            </button>
          </div>

          <div className="text-xs text-[#B6CEC2]">
            <span>{eventData.contactPhone}</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>{eventData.contactEmail}</span>
          </div>
        </div>
      </footer>

      <PosterModal
        isOpen={posterModalOpen}
        imageUrl={eventData.posterImageUrl}
        title={eventData.eventTitle}
        onClose={() => setPosterModalOpen(false)}
      />

      <OrganizerDrawer
        isOpen={organizerOpen}
        initialTab={organizerTab}
        event={eventData}
        rsvps={rsvps}
        onChangeEvent={setEventData}
        onResetDefaults={handleResetDefaults}
        onClose={() => setOrganizerOpen(false)}
      />
    </div>
  );
}
