// Function to get UTC offset for a timezone
function getUTCOffset(timezone: string): string {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const targetTime = new Date(
      utc.toLocaleString("en-US", { timeZone: timezone })
    );
    const utcTime = new Date(utc.toLocaleString("en-US", { timeZone: "UTC" }));

    const offsetMinutes =
      (targetTime.getTime() - utcTime.getTime()) / (1000 * 60);
    const offsetHours = offsetMinutes / 60;

    if (offsetHours === 0) {
      return timezone === "UTC" ? "UTC" : "UTC+0";
    }

    const sign = offsetHours > 0 ? "+" : "-";
    const absHours = Math.abs(offsetHours);

    // Handle fractional hours (like GMT+5:30)
    if (absHours % 1 !== 0) {
      const hours = Math.floor(absHours);
      const minutes = Math.round((absHours - hours) * 60);
      return `UTC${sign}${hours}:${minutes.toString().padStart(2, "0")}`;
    }

    return `UTC${sign}${Math.abs(offsetHours)}`;
  } catch (error) {
    console.warn(`Could not calculate offset for ${timezone}:`, error);
    return "UTC+0";
  }
}

// Base timezone list with their IANA identifiers
const TIMEZONE_DATA = [
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Vienna",
  "Europe/Stockholm",
  "Europe/Oslo",
  "Europe/Copenhagen",
  "Europe/Helsinki",
  "Europe/Athens",
  "Europe/Istanbul",
  "Europe/Moscow",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Toronto",
  "America/Vancouver",
  "America/Montreal",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Buenos_Aires",
  "America/Sao_Paulo",
  "America/Santiago",
  "America/Caracas",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Seoul",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Manila",
  "Asia/Taipei",
  "Asia/Kuala_Lumpur",
  "Asia/Ho_Chi_Minh",
  "Asia/Kolkata",
  "Asia/Mumbai",
  "Asia/Dubai",
  "Asia/Tel_Aviv",
  "Asia/Jerusalem",
  "Asia/Riyadh",
  "Asia/Karachi",
  "Asia/Dhaka",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Perth",
  "Australia/Adelaide",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Pacific/Honolulu",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Africa/Casablanca",
];

// Generate timezones with dynamic UTC offsets
export const TIMEZONES = TIMEZONE_DATA.map((timezone) => {
  const utcOffset = getUTCOffset(timezone);

  // Format city name for display
  let displayName = timezone;
  if (timezone.includes("/")) {
    const [continent, city] = timezone.split("/");
    displayName = `${continent}/${city.replace(/_/g, " ")}`;
  }

  return {
    value: timezone,
    label: `${displayName} (${utcOffset})`,
  };
});

// Helper function to get timezone offset in minutes (useful for date calculations)
export function getTimezoneOffsetMinutes(timezone: string): number {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const targetTime = new Date(
      utc.toLocaleString("en-US", { timeZone: timezone })
    );
    const utcTime = new Date(utc.toLocaleString("en-US", { timeZone: "UTC" }));

    return (targetTime.getTime() - utcTime.getTime()) / (1000 * 60);
  } catch (error) {
    console.warn(`Could not calculate offset for ${timezone}:`, error);
    return 0;
  }
}

// Helper function to convert UTC date to timezone date
export function convertToTimezone(utcDate: Date, timezone: string): Date {
  try {
    // Get the date string in the target timezone
    const timeString = utcDate.toLocaleString("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return new Date(timeString);
  } catch (error) {
    console.warn(`Could not convert date to ${timezone}:`, error);
    return utcDate;
  }
}

// Helper function to get start and end of day in a specific timezone
export function getDayBoundsInTimezone(
  timezone: string,
  date: Date = new Date()
): { start: Date; end: Date } {
  try {
    // Get date string in target timezone
    const dateString = date.toLocaleDateString("en-CA", { timeZone: timezone });

    // Create start of day (00:00:00) in target timezone
    const startOfDay = new Date(`${dateString}T00:00:00`);
    const endOfDay = new Date(`${dateString}T23:59:59.999`);

    // Convert back to UTC for database queries
    const offsetMinutes = getTimezoneOffsetMinutes(timezone);

    return {
      start: new Date(startOfDay.getTime() - offsetMinutes * 60000),
      end: new Date(endOfDay.getTime() - offsetMinutes * 60000),
    };
  } catch (error) {
    console.warn(`Could not get day bounds for ${timezone}:`, error);
    // Fallback to UTC
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
}
