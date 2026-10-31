/**
 * Calendar integration utilities: .ics file download and Google Calendar web link.
 */

export function generateIcsCalendar({ title, description, location, dateId, startTime = "17:00", endTime = "20:00" }) {
  // dateId format: "YYYY-MM-DD"
  const cleanDate = dateId.replace(/-/g, '');
  const startStr = `${cleanDate}T${startTime.replace(':', '')}00`;
  const endStr = `${cleanDate}T${endTime.replace(':', '')}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Turf Day//RSVP Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@weddingturf.event`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `TurfDay-${dateId}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl({ title, description, location, dateId, startTime = "17:00", endTime = "20:00" }) {
  const cleanDate = dateId.replace(/-/g, '');
  const startStr = `${cleanDate}T${startTime.replace(':', '')}00`;
  const endStr = `${cleanDate}T${endTime.replace(':', '')}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: description,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
