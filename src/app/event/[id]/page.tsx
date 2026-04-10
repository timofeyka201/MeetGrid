"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  slotDuration: number;
  startTime: number;
  endTime: number;
  meetingLink?: string;
  participants: Participant[];
}

interface Participant {
  id: string;
  name: string;
  availability: Availability[];
}

interface Availability {
  id: string;
  slotTime: string;
  status: string;
  priority: number;
}

interface TimeSlot {
  date: string;
  time: string;
  datetime: string;
  count: number;
  isSelected: boolean;
}

interface BestTime {
  datetime: string;
  count: number;
}

export default function EventPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bestTime, setBestTime] = useState<BestTime | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    slotDatetime: string;
  } | null>(null);
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Generate all time slots between start and end date
  const generateTimeSlots = useCallback(() => {
    if (!event) return [];

    const slots: TimeSlot[] = [];
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const duration = event.slotDuration;

    // Set start time to 00:00
    startDate.setHours(0, 0, 0, 0);
    
    // Generate slots for each day
    const currentDate = new Date(startDate);
    const startHour = event.startTime;
    const endHour = event.endTime;
    while (currentDate <= endDate) {
      // Generate slots for each day (startTime to endTime)
      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += duration) {
          if (hour === endHour && minute > 0) break; // Stop at endTime

          const slotDate = new Date(currentDate);
          slotDate.setHours(hour, minute, 0, 0);

          if (slotDate > endDate) break;

          const dateStr = slotDate.toLocaleDateString("ru-RU", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          const timeStr = slotDate.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const datetimeStr = slotDate.toISOString();

          // Count how many participants selected this slot
          let count = 0;
          event.participants.forEach((p) => {
            p.availability.forEach((a) => {
              const aDate = new Date(a.slotTime);
              if (
                aDate.getHours() === hour &&
                aDate.getMinutes() === minute &&
                aDate.getDate() === currentDate.getDate() &&
                aDate.getMonth() === currentDate.getMonth() &&
                aDate.getFullYear() === currentDate.getFullYear()
              ) {
                count++;
              }
            });
          });

          slots.push({
            date: dateStr,
            time: timeStr,
            datetime: datetimeStr,
            count,
            isSelected: false,
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }, [event]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Group slots by time for grid display
  const getUniqueTimes = (slots: TimeSlot[]) => {
    const times = new Set(slots.map((s) => s.time));
    return Array.from(times);
  };

  const getUniqueDates = (slots: TimeSlot[]) => {
    const dates = new Set(slots.map((s) => s.date));
    return Array.from(dates);
  };

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/event?id=${eventId}`);
        if (!response.ok) {
          throw new Error("Событие не найдено");
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  // Generate time slots when event is loaded
  useEffect(() => {
    if (event) {
      const slots = generateTimeSlots();
      setTimeSlots(slots);

      // Find best time
      if (slots.length > 0) {
        const maxSlot = slots.reduce((max, slot) =>
          slot.count > max.count ? slot : max
        );
        if (maxSlot.count > 0) {
          setBestTime({
            datetime: maxSlot.datetime,
            count: maxSlot.count,
          });
        }
      }
    }
  }, [event, generateTimeSlots]);

  const toggleSlot = (datetime: string) => {
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(datetime)) {
        newSet.delete(datetime);
      } else {
        newSet.add(datetime);
      }
      return newSet;
    });
  };

  const handleSaveAvailability = async () => {
    if (!participantName.trim()) {
      setError("Введите ваше имя");
      return;
    }

    if (selectedSlots.size === 0) {
      setError("Выберите хотя бы один временной слот");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          participantName: participantName.trim(),
          slots: Array.from(selectedSlots),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка сохранения");
      }

      setSaved(true);
      setSelectedSlots(new Set());
      
      // Reload event data to show updated heatmap
      const updatedEvent = await fetch(`/api/event?id=${eventId}`);
      const eventData = await updatedEvent.json();
      setEvent(eventData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const getCellColor = (count: number, isSelected: boolean) => {
    if (isSelected) {
      return "bg-blue-500 border-blue-600";
    }
    if (count === 0) {
      return "bg-white border-gray-200 hover:bg-blue-100";
    }
    if (count <= 2) {
      return "bg-blue-200 border-blue-300";
    }
    if (count <= 4) {
      return "bg-blue-400 border-blue-500 text-white";
    }
    return "bg-blue-600 border-blue-700 text-white";
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Ссылка скопирована в буфер обмена!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const uniqueTimes = getUniqueTimes(timeSlots);
  const uniqueDates = getUniqueDates(timeSlots);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {event?.title}
              </h1>
              {event?.description && (
                <p className="mt-1 text-gray-600">{event.description}</p>
              )}
              {event?.meetingLink && (
                <div className="mt-3">
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Присоединиться к встрече
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={copyLink}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Копировать ссылку
            </button>
          </div>

          {/* Best Time */}
          {bestTime && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800">
        Лучшее время для встречи:
              </p>
              <p className="text-lg font-bold text-blue-900">
                {new Date(bestTime.datetime).toLocaleDateString("ru-RU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                ({bestTime.count} {bestTime.count === 1 ? "участник" : bestTime.count < 5 ? "участника" : "участников"})
              </p>
            </div>
          )}
        </div>

        {/* Participant Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ваше имя
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              id="name"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Введите ваше имя"
            />
            <button
              onClick={handleSaveAvailability}
              disabled={saving || selectedSlots.size === 0}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
          {saved && (
            <p className="mt-2 text-sm text-blue-600">
              Ваша доступность сохранена!
            </p>
          )}
        </div>

        {/* Participants List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Участники ({event?.participants.length || 0})
          </h2>
          {event?.participants.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Пока нет участников. Будьте первым!
            </p>
          ) : (
            <ul className="space-y-2">
              {event?.participants.map((participant) => (
                <li
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {participant.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {participant.availability.length} слот
                    {participant.availability.length === 1 ? "" : "а"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Availability Grid */}
        <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Выберите доступное время
          </h2>

          {timeSlots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Нет доступных временных слотов
            </p>
          ) : (
            <div className="min-w-max">
              {/* Header Row - Dates */}
              <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `80px repeat(${uniqueDates.length}, 1fr)` }}>
                <div></div>
                {uniqueDates.map((date) => (
                  <div
                    key={date}
                    className="text-center text-sm font-medium text-gray-700 py-2"
                  >
                    {date}
                  </div>
                ))}
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-1">
                {uniqueTimes.map((time) => (
                  <div
                    key={time}
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `80px repeat(${uniqueDates.length}, 1fr)` }}
                  >
                    {/* Time Label */}
                    <div className="text-sm text-gray-600 py-2 px-2 flex items-center">
                      {time}
                    </div>

                    {/* Cells */}
                    {uniqueDates.map((date) => {
                      const slot = timeSlots.find(
                        (s) => s.time === time && s.date === date
                      );
                      if (!slot) return null;

                      return (
                        <button
                          key={`${date}-${time}`}
                          onClick={() => toggleSlot(slot.datetime)}
                          className={`h-10 rounded border transition-colors ${getCellColor(
                            slot.count,
                            selectedSlots.has(slot.datetime)
                          )}`}
                          title={`${date} ${time} - ${slot.count} участников`}
                        >
                          {slot.count > 0 && (
                            <span className="text-xs font-medium">
                              {slot.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Условные обозначения:</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white border border-gray-200 rounded"></div>
                <span className="text-sm text-gray-600">0 участников</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-200 border border-blue-300 rounded"></div>
                <span className="text-sm text-gray-600">1-2 участника</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-400 border border-blue-500 rounded text-white text-xs flex items-center justify-center">3</div>
                <span className="text-sm text-gray-600">3-4 участника</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 border border-blue-700 rounded text-white text-xs flex items-center justify-center">5</div>
                <span className="text-sm text-gray-600">5+ участников</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 border border-blue-600 rounded"></div>
                <span className="text-sm text-gray-600">Ваш выбор</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a href="/create" className="text-sm text-blue-600 hover:text-blue-500">
            Создать своё событие
          </a>
        </div>
      </div>
    </div>
  );
}
