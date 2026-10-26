const fs = require("node:fs");
const path = require("node:path");

const timeZone = "Europe/Madrid";
let latitude = 43.558333 * Math.PI / 180;
let longitude = -5.698333 * Math.PI / 180;
const degree = Math.PI / 180;
const radians = 180 / Math.PI;
const root = path.resolve(__dirname, "..");
const tideFile = path.join(root, "assets", "data", "gijon-tides.xml");
const outputFile = path.join(root, "assets", "data", "gijon-solunar.xml");
const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
});

function localParts(date) {
  return Object.fromEntries(formatter.formatToParts(date)
    .filter((part) => part.type !== "literal")
    .map((part) => [part.type, part.value]));
}

function localMidnightToUtc(year, month, day) {
  const target = Date.UTC(year, month - 1, day);
  let timestamp = target;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = localParts(new Date(timestamp));
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    timestamp += target - represented;
  }
  return timestamp;
}

function dateString(timestamp) {
  const parts = localParts(new Date(timestamp));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function timeString(timestamp) {
  const parts = localParts(new Date(timestamp));
  return `${parts.hour}:${parts.minute}`;
}

function sunPosition(timestamp) {
  const days = timestamp / 86400000 + 2440587.5 - 2451545;
  const meanAnomaly = degree * (357.529 + 0.98560028 * days);
  const meanLongitude = degree * (280.459 + 0.98564736 * days);
  const eclipticLongitude = meanLongitude
    + degree * (1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly));
  const obliquity = degree * (23.439 - 0.00000036 * days);
  const rightAscension = Math.atan2(
    Math.cos(obliquity) * Math.sin(eclipticLongitude),
    Math.cos(eclipticLongitude)
  );
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLongitude));
  return { rightAscension, declination, eclipticLongitude };
}

function moonPosition(timestamp) {
  const days = timestamp / 86400000 + 2440587.5 - 2451545;
  const longitudeMean = degree * (218.316 + 13.176396 * days);
  const anomaly = degree * (134.963 + 13.064993 * days);
  const latitudeMean = degree * (93.272 + 13.22935 * days);
  const eclipticLongitude = longitudeMean + degree * 6.289 * Math.sin(anomaly);
  const eclipticLatitude = degree * 5.128 * Math.sin(latitudeMean);
  const obliquity = degree * 23.4397;
  const rightAscension = Math.atan2(
    Math.sin(eclipticLongitude) * Math.cos(obliquity)
      - Math.tan(eclipticLatitude) * Math.sin(obliquity),
    Math.cos(eclipticLongitude)
  );
  const declination = Math.asin(
    Math.sin(eclipticLatitude) * Math.cos(obliquity)
      + Math.cos(eclipticLatitude) * Math.sin(obliquity) * Math.sin(eclipticLongitude)
  );
  const distance = 385001 - 20905 * Math.cos(anomaly);
  return { rightAscension, declination, distance, eclipticLongitude };
}

function altitude(timestamp, body) {
  const position = body === "moon" ? moonPosition(timestamp) : sunPosition(timestamp);
  const days = timestamp / 86400000 + 2440587.5 - 2451545;
  const hourAngle = degree * (280.16 + 360.9856235 * days) + longitude - position.rightAscension;
  const sineAltitude = Math.sin(latitude) * Math.sin(position.declination)
    + Math.cos(latitude) * Math.cos(position.declination) * Math.cos(hourAngle);
  const geometricAltitude = Math.asin(Math.max(-1, Math.min(1, sineAltitude)));
  if (body !== "moon") return geometricAltitude;
  const parallax = Math.asin(6378.14 / position.distance);
  return geometricAltitude - parallax * Math.cos(geometricAltitude);
}

function refineExtremum(fn, left, right, maximum) {
  for (let iteration = 0; iteration < 36; iteration += 1) {
    const first = left + (right - left) / 3;
    const second = right - (right - left) / 3;
    const firstValue = fn(first) * (maximum ? -1 : 1);
    const secondValue = fn(second) * (maximum ? -1 : 1);
    if (firstValue < secondValue) right = second;
    else left = first;
  }
  return (left + right) / 2;
}

function findExtremum(fn, start, end, maximum) {
  const step = 10 * 60 * 1000;
  let bestTime = start;
  let bestValue = fn(start) * (maximum ? 1 : -1);
  for (let time = start + step; time < end; time += step) {
    const value = fn(time) * (maximum ? 1 : -1);
    if (value > bestValue) {
      bestValue = value;
      bestTime = time;
    }
  }
  const refined = refineExtremum(fn, Math.max(start, bestTime - step), Math.min(end, bestTime + step), maximum);
  return refined > start && refined < end ? refined : null;
}

function findHorizonCrossings(fn, start, end, threshold) {
  const step = 10 * 60 * 1000;
  const events = [];
  let previousTime = start;
  let previousValue = fn(previousTime) - threshold;
  for (let time = start + step; time <= end; time += step) {
    const value = fn(Math.min(time, end)) - threshold;
    if ((previousValue < 0 && value >= 0) || (previousValue >= 0 && value < 0)) {
      let low = previousTime;
      let high = Math.min(time, end);
      const rising = value > previousValue;
      for (let iteration = 0; iteration < 30; iteration += 1) {
        const middle = (low + high) / 2;
        const middleValue = fn(middle) - threshold;
        if ((middleValue >= 0) === rising) high = middle;
        else low = middle;
      }
      events.push({ timestamp: (low + high) / 2, rising });
    }
    previousTime = Math.min(time, end);
    previousValue = value;
  }
  return events;
}

function phaseName(timestamp) {
  const moon = moonPosition(timestamp);
  const sun = sunPosition(timestamp);
  let angle = (moon.eclipticLongitude - sun.eclipticLongitude) % (2 * Math.PI);
  if (angle < 0) angle += 2 * Math.PI;
  angle *= radians;
  if (angle < 45 || angle >= 315) return "Luna nueva";
  if (angle < 135) return "Cuarto creciente";
  if (angle < 225) return "Luna llena";
  return "Cuarto menguante";
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;"
  })[character]);
}

function readCoverage() {
  const xml = fs.readFileSync(tideFile, "utf8");
  const rootTag = xml.match(/<mareas\b[^>]*>/)?.[0];
  if (!rootTag) throw new Error("The Gijón tide XML has no root element.");
  const from = rootTag.match(/\bdesde="([^"]+)"/)?.[1];
  const through = rootTag.match(/\bhasta="([^"]+)"/)?.[1];
  const lat = rootTag.match(/\blat="([^"]+)"/)?.[1];
  const lon = rootTag.match(/\blon="([^"]+)"/)?.[1];
  if (!from || !through || !lat || !lon) throw new Error("The Gijón tide XML is missing coverage or coordinate metadata.");
  return { from, through, lat, lon };
}

const coverage = readCoverage();
latitude = Number(coverage.lat) * degree;
longitude = Number(coverage.lon) * degree;
const startDate = new Date(`${coverage.from}T12:00:00Z`);
const endDate = new Date(`${coverage.through}T12:00:00Z`);
const records = [];

for (let date = new Date(startDate); date <= endDate; date.setUTCDate(date.getUTCDate() + 1)) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const dateStart = localMidnightToUtc(year, month, day);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
  const dateEnd = localMidnightToUtc(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, nextDate.getUTCDate());
  const moonCrossings = findHorizonCrossings((time) => altitude(time, "moon"), dateStart, dateEnd, -0.3 * degree);
  const sunCrossings = findHorizonCrossings((time) => altitude(time, "sun"), dateStart, dateEnd, -0.833 * degree);
  const solarTransit = findExtremum((time) => altitude(time, "sun"), dateStart, dateEnd, true);
  const events = [
    ...moonCrossings.map((event) => ({ type: event.rising ? "salida" : "puesta", timestamp: event.timestamp })),
    ...sunCrossings.map((event) => ({ type: event.rising ? "amanecer" : "atardecer", timestamp: event.timestamp }))
  ];
  const upperTransit = findExtremum((time) => altitude(time, "moon"), dateStart, dateEnd, true);
  const lowerTransit = findExtremum((time) => altitude(time, "moon"), dateStart, dateEnd, false);
  if (solarTransit) events.push({ type: "transito-solar", timestamp: solarTransit });
  if (upperTransit) events.push({ type: "transito-superior", timestamp: upperTransit });
  if (lowerTransit) events.push({ type: "transito-inferior", timestamp: lowerTransit });
  events.sort((first, second) => first.timestamp - second.timestamp);
  const noon = localMidnightToUtc(year, month, day) + 12 * 60 * 60 * 1000;
  records.push({
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    phase: phaseName(noon),
    events
  });
}

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  `<solunares fuente="cálculo astronómico local" puerto="Gijón" lat="${coverage.lat}" lon="${coverage.lon}" desde="${coverage.from}" hasta="${coverage.through}" generado="${new Date().toISOString().slice(0, 10)}">`,
  "  <atribucion>Eventos solunares estimados localmente a partir de coordenadas y efemérides aproximadas. La curva de pesca es orientativa, no una garantía de actividad.</atribucion>",
  "  <dias>"
];

for (const record of records) {
  lines.push(`    <dia fecha="${record.date}" fase="${escapeXml(record.phase)}">`);
  for (const event of record.events) {
    lines.push(`      <evento tipo="${event.type}" hora="${timeString(event.timestamp)}" fecha="${dateString(event.timestamp)}" />`);
  }
  lines.push("    </dia>");
}

lines.push("  </dias>", "</solunares>", "");
fs.writeFileSync(outputFile, lines.join("\n"), "utf8");
console.log(`Wrote ${records.length} local solunar days to ${path.relative(root, outputFile)}.`);
