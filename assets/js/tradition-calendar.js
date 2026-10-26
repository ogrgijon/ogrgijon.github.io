(() => {
  const tidePanel = document.querySelector("[data-gijon-tides]");
  if (tidePanel) {
    const status = tidePanel.querySelector("[data-tide-status]");
    const list = tidePanel.querySelector("[data-tide-list]");
    const chart = tidePanel.querySelector("[data-tide-chart]");
    const fishingStatus = tidePanel.querySelector("[data-fishing-status]");
    const fishingList = tidePanel.querySelector("[data-fishing-list]");
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const timeParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const localDateLabel = new Intl.DateTimeFormat("es", {
      timeZone: "UTC",
      weekday: "short",
      day: "numeric",
      month: "short"
    });
    const compactDateLabel = new Intl.DateTimeFormat("es", {
      timeZone: "UTC",
      day: "numeric",
      month: "short"
    });
    const getParts = (formatter, date) => Object.fromEntries(formatter.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]));
    const toMadridTimestamp = (date, time) => {
      const [year, month, day] = date.split("-").map(Number);
      const [hour, minute] = time.split(":").map(Number);
      const wallTime = Date.UTC(year, month - 1, day, hour, minute);
      let timestamp = wallTime;
      for (let iteration = 0; iteration < 3; iteration += 1) {
        const localDate = getParts(dateParts, new Date(timestamp));
        const localTime = getParts(timeParts, new Date(timestamp));
        const represented = Date.UTC(
          Number(localDate.year),
          Number(localDate.month) - 1,
          Number(localDate.day),
          Number(localTime.hour),
          Number(localTime.minute)
        );
        timestamp += wallTime - represented;
      }
      return timestamp;
    };
    const formatLocalTime = (timestamp) => timeParts.format(new Date(timestamp));
    const formatLocalDate = (timestamp) => {
      const localDate = getParts(dateParts, new Date(timestamp));
      return localDateLabel.format(new Date(Date.UTC(
        Number(localDate.year),
        Number(localDate.month) - 1,
        Number(localDate.day),
        12
      )));
    };
    const intersect = (first, second) => {
      const start = Math.max(first.start, second.start);
      const end = Math.min(first.end, second.end);
      return start < end ? { start, end } : null;
    };
    const createFishingWindows = (solunarXml, tideEvents, now, chartStart, chartEnd) => {
      const solarAndLunarEvents = [...solunarXml.querySelectorAll("dias > dia")]
        .flatMap((day) => [...day.querySelectorAll("evento")].map((event) => ({
          type: event.getAttribute("tipo"),
          phase: day.getAttribute("fase"),
          timestamp: toMadridTimestamp(event.getAttribute("fecha"), event.getAttribute("hora"))
        })))
        .filter((event) => event.timestamp >= now - 2 * 60 * 60 * 1000
          && event.timestamp <= chartEnd + 2 * 60 * 60 * 1000);
      const tides = tideEvents.filter((tide) => tide.timestamp >= chartStart - 12 * 60 * 60 * 1000
        && tide.timestamp <= chartEnd + 12 * 60 * 60 * 1000);
      const movementWindows = tides.map((tide) => ({
        start: tide.timestamp - 2 * 60 * 60 * 1000,
        end: tide.timestamp + 2 * 60 * 60 * 1000,
        tide
      }));
      const risingIntervals = [];
      for (let index = 0; index < tides.length - 1; index += 1) {
        if (tides[index].type === "bajamar" && tides[index + 1].type === "pleamar") {
          risingIntervals.push({ start: tides[index].timestamp, end: tides[index + 1].timestamp });
        }
      }
      const solarEvents = solarAndLunarEvents.filter((event) => event.type === "amanecer" || event.type === "atardecer");
      const fishingWindows = [];
      const addWindow = (overlap, level, reason) => {
        const window = {
          start: Math.max(overlap.start, now, chartStart),
          end: Math.min(overlap.end, chartEnd),
          level,
          reason
        };
        if (window.start < window.end) fishingWindows.push(window);
      };
      solarAndLunarEvents.forEach((event) => {
        const major = event.type === "transito-superior" || event.type === "transito-inferior";
        const minor = event.type === "salida" || event.type === "puesta";
        if (!major && !minor) return;
        const duration = major ? 60 : 30;
        const period = {
          start: event.timestamp - duration * 60 * 1000,
          end: event.timestamp + duration * 60 * 1000
        };
        if (period.end <= now) return;
        const movementMatches = movementWindows
          .map((movement) => ({ movement, overlap: intersect(period, movement) }))
          .filter((match) => match.overlap);
        if (major) {
          const favorableIntervals = [];
          risingIntervals.forEach((rising) => {
            const favorable = intersect(period, rising);
            if (favorable) favorableIntervals.push(favorable);
          });
          tides.filter((tide) => tide.type === "pleamar").forEach((highTide) => {
            const preHigh = { start: highTide.timestamp - 2 * 60 * 60 * 1000, end: highTide.timestamp };
            const movement = movementWindows.find((item) => item.tide === highTide);
            if (!movement) return;
            const nearHigh = intersect(period, preHigh);
            const favorable = nearHigh && intersect(nearHigh, movement);
            if (favorable) favorableIntervals.push(favorable);
          });
          if (favorableIntervals.length) {
            favorableIntervals.forEach((overlap) => {
              const dawnOrDusk = solarEvents.find((solar) => intersect(overlap, {
                start: solar.timestamp - 30 * 60 * 1000,
                end: solar.timestamp + 30 * 60 * 1000
              }));
              addWindow(overlap, "excellent", dawnOrDusk
                ? `Periodo mayor + marea favorable cerca del ${dawnOrDusk.type === "amanecer" ? "amanecer" : "atardecer"}`
                : "Periodo mayor con marea subiendo o en las 2 h previas a pleamar");
            });
          } else if (event.phase?.includes("Cuarto") && movementMatches.length === 0) {
            addWindow(period, "low", "Periodo mayor en fase de cuarto y sin movimiento de marea cercano");
          }
          return;
        }
        movementMatches.forEach(({ movement, overlap }) => {
          const turn = { start: movement.tide.timestamp - 30 * 60 * 1000, end: movement.tide.timestamp + 30 * 60 * 1000 };
          const nearTurn = intersect(overlap, turn);
          if (nearTurn) addWindow(nearTurn, "good", `Periodo menor cerca del giro de ${movement.tide.type}`);
        });
      });
      const merged = [];
      fishingWindows.sort((first, second) => first.start - second.start).forEach((window) => {
        const previous = merged[merged.length - 1];
        if (previous && previous.level === window.level && window.start <= previous.end + 10 * 60 * 1000) {
          previous.end = Math.max(previous.end, window.end);
          if (!previous.reason.includes(window.reason)) previous.reason += ` · ${window.reason}`;
        } else {
          merged.push({ ...window });
        }
      });
      return merged;
    };
    const renderFishingWindows = (windows) => {
      fishingList.replaceChildren();
      windows.slice(0, 6).forEach((window) => {
        const item = document.createElement("li");
        item.className = `gijon-fishing__window gijon-fishing__window--${window.level}`;
        const badge = document.createElement("span");
        badge.className = "gijon-fishing__badge";
        badge.textContent = window.level === "excellent" ? "Excelente" : window.level === "good" ? "Bueno" : "Bajo";
        const time = document.createElement("time");
        time.dateTime = new Date(window.start).toISOString();
        time.textContent = `${formatLocalDate(window.start)} · ${formatLocalTime(window.start)}–${formatLocalTime(window.end)}`;
        const reason = document.createElement("p");
        reason.textContent = window.reason;
        item.append(badge, time, reason);
        fishingList.append(item);
      });
      const favorableCount = windows.filter((window) => window.level !== "low").length;
      fishingStatus.textContent = favorableCount
        ? `${favorableCount} coincidencia${favorableCount === 1 ? "" : "s"} favorable${favorableCount === 1 ? "" : "s"} en las próximas mareas. Orientativo; no garantiza capturas.`
        : "No se detectan coincidencias solunares favorables en las próximas mareas; la actividad natural puede variar.";
    };
    const renderChart = (entries, fishingWindows, skyEvents) => {
      const namespace = "http://www.w3.org/2000/svg";
      const width = 960;
      const height = 300;
      const left = 64;
      const right = 936;
      const top = 24;
      const bottom = 224;
      const values = entries.map((entry) => Number(entry.getAttribute("altura")));
      if (values.some((value) => !Number.isFinite(value))) throw new Error("El archivo contiene alturas de marea no válidas.");
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = Math.max((max - min) * 0.18, 0.25);
      const low = min - padding;
      const high = max + padding;
      const firstTime = entries[0].timestamp;
      const lastTime = entries[entries.length - 1].timestamp;
      const xForTime = (timestamp) => left + (right - left) * (timestamp - firstTime) / (lastTime - firstTime);
      const points = entries.map((entry, index) => ({
        x: xForTime(entry.timestamp),
        y: bottom - (Number(entry.getAttribute("altura")) - low) / (high - low) * (bottom - top),
        entry
      }));
      const svg = document.createElementNS(namespace, "svg");
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-labelledby", "gijon-wave-title gijon-wave-description");
      const title = document.createElementNS(namespace, "title");
      title.setAttribute("id", "gijon-wave-title");
      title.textContent = "Onda de marea prevista en Gijón";
      const description = document.createElementNS(namespace, "desc");
      description.setAttribute("id", "gijon-wave-description");
      description.textContent = "Curva aproximada de mareas oficiales con bandas de actividad de pesca y marcadores de salida y puesta del Sol, tránsitos lunares y mediodía solar.";
      svg.append(title, description);

      const defs = document.createElementNS(namespace, "defs");
      const gradient = document.createElementNS(namespace, "linearGradient");
      gradient.setAttribute("id", "gijon-wave-fill");
      gradient.setAttribute("x1", "0");
      gradient.setAttribute("x2", "0");
      gradient.setAttribute("y1", "0");
      gradient.setAttribute("y2", "1");
      [["0%", "#bd573a", "0.2"], ["100%", "#bd573a", "0.01"]].forEach(([offset, color, opacity]) => {
        const stop = document.createElementNS(namespace, "stop");
        stop.setAttribute("offset", offset);
        stop.setAttribute("stop-color", color);
        stop.setAttribute("stop-opacity", opacity);
        gradient.append(stop);
      });
      defs.append(gradient);
      svg.append(defs);

      const addSvgElement = (tag, attributes, text) => {
        const element = document.createElementNS(namespace, tag);
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        if (text) element.textContent = text;
        svg.append(element);
        return element;
      };
      for (let index = 0; index < 4; index += 1) {
        const value = high - (high - low) * index / 3;
        const y = top + (bottom - top) * index / 3;
        addSvgElement("line", { x1: left, y1: y, x2: right, y2: y, class: "gijon-wave__grid" });
        addSvgElement("text", { x: left - 12, y: y + 4, "text-anchor": "end", class: "gijon-wave__axis" }, `${value.toFixed(1)} m`);
      }
      const curve = points.reduce((path, point, index) => {
        if (!index) return `M ${point.x} ${point.y}`;
        const previous = points[index - 1];
        const before = points[Math.max(0, index - 2)];
        const after = points[Math.min(points.length - 1, index + 1)];
        const controlOneX = previous.x + (point.x - before.x) / 6;
        const controlOneY = previous.y + (point.y - before.y) / 6;
        const controlTwoX = point.x - (after.x - previous.x) / 6;
        const controlTwoY = point.y - (after.y - previous.y) / 6;
        return `${path} C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${point.x} ${point.y}`;
      }, "");
      addSvgElement("path", { d: `${curve} L ${right} ${bottom} L ${left} ${bottom} Z`, class: "gijon-wave__area" });
      fishingWindows.forEach((window) => {
        const start = Math.max(window.start, firstTime);
        const end = Math.min(window.end, lastTime);
        if (start >= end) return;
        const rect = addSvgElement("rect", {
          x: xForTime(start),
          y: top,
          width: Math.max(1, xForTime(end) - xForTime(start)),
          height: bottom - top,
          class: `gijon-wave__fishing gijon-wave__fishing--${window.level}`
        });
        const label = document.createElementNS(namespace, "title");
        label.textContent = window.reason;
        rect.append(label);
      });
      addSvgElement("path", { d: curve, class: "gijon-wave__curve" });
      const markerLabels = {
        amanecer: { label: "Sol ↑", className: "sun" },
        atardecer: { label: "Sol ↓", className: "sun" },
        "transito-superior": { label: "Luna ↑", className: "moon" },
        "transito-inferior": { label: "Luna ↓", className: "moon" },
        "transito-solar": { label: "Mediodía", className: "solar-noon" }
      };
      const labelEndByLane = [];
      skyEvents.forEach((event) => {
        const marker = markerLabels[event.type];
        if (!marker) return;
        const x = xForTime(event.timestamp);
        let lane = labelEndByLane.findIndex((end) => x - end > 70);
        if (lane < 0) lane = labelEndByLane.length;
        labelEndByLane[lane] = x + 68;
        const line = addSvgElement("line", {
          x1: x,
          y1: top,
          x2: x,
          y2: bottom,
          class: `gijon-wave__sky-line gijon-wave__sky-line--${marker.className}`
        });
        const label = document.createElementNS(namespace, "title");
        label.textContent = `${marker.label}: ${formatLocalDate(event.timestamp)} ${formatLocalTime(event.timestamp)}`;
        line.append(label);
        addSvgElement("circle", {
          cx: x,
          cy: top,
          r: 3,
          class: `gijon-wave__point gijon-wave__sky-point--${marker.className}`
        });
        const labelAtRightEdge = x > right - 65;
        addSvgElement("text", {
          x: x + (labelAtRightEdge ? -4 : 4),
          y: top - 10 + lane * 12,
          "text-anchor": labelAtRightEdge ? "end" : "start",
          class: "gijon-wave__sky-label"
        }, marker.label);
      });
      points.forEach((point, index) => {
        const entry = point.entry;
        const mark = addSvgElement("circle", {
          cx: point.x,
          cy: point.y,
          r: 5,
          class: entry.getAttribute("tipo") === "pleamar" ? "gijon-wave__point gijon-wave__point--high" : "gijon-wave__point"
        });
        const pointTitle = document.createElementNS(namespace, "title");
        pointTitle.textContent = `${entry.getAttribute("tipo") === "pleamar" ? "Pleamar" : "Bajamar"}: ${entry.getAttribute("fecha")} ${entry.getAttribute("hora")}, ${entry.getAttribute("altura")} m`;
        mark.append(pointTitle);
        if (index % 2 === 0 || index === points.length - 1) {
          addSvgElement("text", { x: point.x, y: bottom + 24, "text-anchor": "middle", class: "gijon-wave__axis" }, `${compactDateLabel.format(new Date(entry.timestamp))} ${formatLocalTime(entry.timestamp)}`);
        }
      });
      chart.replaceChildren(svg);
    };
    const showTides = async () => {
      const [tideResponse, solunarResponse] = await Promise.all([
        fetch(tidePanel.dataset.tideSrc),
        fetch(tidePanel.dataset.solunarSrc)
      ]);
      if (!tideResponse.ok) throw new Error(`No se pudo cargar el XML local de mareas (${tideResponse.status}).`);
      if (!solunarResponse.ok) throw new Error(`No se pudo cargar el XML local solunar (${solunarResponse.status}).`);
      const [tideText, solunarText] = await Promise.all([tideResponse.text(), solunarResponse.text()]);
      const tideXml = new DOMParser().parseFromString(tideText, "application/xml");
      const solunarXml = new DOMParser().parseFromString(solunarText, "application/xml");
      if (tideXml.querySelector("parsererror")) throw new Error("El archivo local de mareas no contiene XML válido.");
      if (solunarXml.querySelector("parsererror")) throw new Error("El archivo local solunar no contiene XML válido.");
      const tideRoot = tideXml.querySelector("mareas");
      const solunarRoot = solunarXml.querySelector("solunares");
      if (!tideRoot || tideRoot.getAttribute("id") !== "6") throw new Error("El XML de mareas no corresponde al puerto de Gijón.");
      if (!solunarRoot || solunarRoot.getAttribute("puerto") !== "Gijón") throw new Error("El XML solunar no corresponde a Gijón.");
      if (solunarRoot.getAttribute("desde") !== tideRoot.getAttribute("desde")
        || solunarRoot.getAttribute("hasta") !== tideRoot.getAttribute("hasta")) {
        throw new Error("El XML solunar y el de mareas tienen periodos distintos; regenera el archivo solunar.");
      }
      const now = Date.now();
      const allTides = [...tideXml.querySelectorAll("datos > marea")].map((entry) => ({
        entry,
        type: entry.getAttribute("tipo"),
        timestamp: toMadridTimestamp(entry.getAttribute("fecha"), entry.getAttribute("hora"))
      }));
      const entries = allTides.filter((event) => event.timestamp >= now).slice(0, 8);
      if (!entries.length) {
        status.textContent = "No quedan mareas futuras en el archivo oficial disponible. La cobertura llega hasta el 31 de diciembre de 2027.";
        fishingStatus.textContent = "No quedan mareas futuras en el XML local para cruzar con los periodos solunares.";
        return;
      }
      const fishingWindows = createFishingWindows(
        solunarXml,
        allTides,
        now,
        entries[0].timestamp,
        entries[entries.length - 1].timestamp
      );
      const graphEntries = entries.map((event) => {
        event.entry.timestamp = event.timestamp;
        return event.entry;
      });
      const skyMarkers = [...solunarXml.querySelectorAll("dias > dia > evento")]
        .map((event) => ({
          type: event.getAttribute("tipo"),
          timestamp: toMadridTimestamp(event.getAttribute("fecha"), event.getAttribute("hora"))
        }))
        .filter((event) => ["amanecer", "atardecer", "transito-superior", "transito-inferior", "transito-solar"].includes(event.type)
          && event.timestamp >= entries[0].timestamp
          && event.timestamp <= entries[entries.length - 1].timestamp);
      renderChart(graphEntries, fishingWindows, skyMarkers);
      renderFishingWindows(fishingWindows);
      list.replaceChildren();
      entries.forEach(({ entry, timestamp }) => {
        const item = document.createElement("li");
        item.className = "gijon-tides__event";
        const when = document.createElement("time");
        when.dateTime = new Date(timestamp).toISOString();
        when.textContent = `${formatLocalDate(timestamp)} · ${formatLocalTime(timestamp)}`;
        const type = document.createElement("span");
        const highTide = entry.getAttribute("tipo") === "pleamar";
        type.className = `gijon-tides__type${highTide ? " gijon-tides__type--high" : ""}`;
        type.textContent = highTide ? "Pleamar" : "Bajamar";
        const height = document.createElement("strong");
        height.textContent = `${entry.getAttribute("altura")} m`;
        item.append(when, type, height);
        list.append(item);
      });
      status.textContent = `Próximas mareas publicadas por el IHM · Puerto ${tideRoot.getAttribute("puerto")}.`;
    };
    showTides().catch((error) => {
      status.textContent = `No se pudo mostrar la predicción oficial de Gijón: ${error.message}`;
      console.error(error);
    });
  }

  const root = document.querySelector("[data-tradition-calendar]");
  if (!root) return;

  const monthLabel = root.querySelector("[data-calendar-month]");
  const grid = root.querySelector("[data-calendar-grid]");
  const key = root.querySelector("[data-calendar-key]");
  const locale = document.documentElement.lang || "es";
  const monthNames = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "Europe/Madrid" });
  const monthOnly = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "Europe/Madrid" });
  const monthSelect = document.createElement("select");
  monthSelect.className = "tradition-calendar__month-select";
  monthSelect.setAttribute("aria-label", locale.startsWith("es") ? "Seleccionar mes" : "Choose month");
  for (let month = 0; month < 12; month += 1) {
    const option = document.createElement("option");
    option.value = String(month);
    option.textContent = new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2020, month, 1));
    monthSelect.append(option);
  }
  monthLabel.replaceWith(monthSelect);
  const selectMonth = (month) => {
    const selectedMonth = month.getMonth() + 1;
    const articles = document.querySelectorAll("[data-tradition-month]");
    let visible = 0;
    articles.forEach((article) => {
      const matches = Number(article.dataset.traditionMonth) === selectedMonth;
      article.hidden = !matches;
      if (matches) visible += 1;
    });
    const currentMonth = document.querySelector("[data-current-month-label]");
    if (currentMonth) currentMonth.textContent = monthNames.format(month).toLocaleUpperCase(locale);
    const empty = document.querySelector("[data-tradition-empty]");
    if (empty) empty.hidden = visible > 0;
  };
  const weekdays = ["L", "M", "X", "J", "V", "S", "D"];
  const signStarts = [
    [120, "♒"], [219, "♓"], [321, "♈"], [420, "♉"], [521, "♊"], [621, "♋"],
    [723, "♌"], [823, "♍"], [923, "♎"], [1023, "♏"], [1122, "♐"], [1222, "♑"]
  ];
  const phases = [
    { phase: 0, name: "Luna nueva", icon: "●" },
    { phase: 0.25, name: "Cuarto creciente", icon: "◐" },
    { phase: 0.5, name: "Luna llena", icon: "○" },
    { phase: 0.75, name: "Cuarto menguante", icon: "◑" }
  ];
  const synodicMonth = 29.530588853;
  const newMoonEpoch = Date.UTC(2000, 0, 6, 18, 14);
  let cursor = new Date();
  cursor = new Date(cursor.getFullYear(), cursor.getMonth(), 1);

  const getPhase = (date) => {
    const elapsed = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - newMoonEpoch) / 86400000;
    return ((elapsed / synodicMonth) % 1 + 1) % 1;
  };
  const getSign = (date) => {
    const monthDay = (date.getMonth() + 1) * 100 + date.getDate();
    return [...signStarts].reverse().find(([start]) => monthDay >= start)?.[1] || "♑";
  };
  const getPhaseName = (phase) => {
    const nearest = phases.reduce((best, item) => {
      const distance = Math.min(Math.abs(phase - item.phase), 1 - Math.abs(phase - item.phase));
      return distance < best.distance ? { ...item, distance } : best;
    }, { distance: 1 });
    return nearest.distance < 0.018 ? nearest.name : "";
  };

  const render = () => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const today = new Date();
    monthSelect.value = String(month);
    monthSelect.setAttribute("aria-label", `${locale.startsWith("es") ? "Seleccionar mes" : "Choose month"} · ${year}`);
    grid.replaceChildren();
    key.replaceChildren();
    weekdays.forEach((day) => {
      const heading = document.createElement("span");
      heading.className = "tradition-calendar__weekday";
      heading.setAttribute("role", "columnheader");
      heading.textContent = day;
      grid.append(heading);
    });
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(year, month, index - firstWeekday + 1);
      const day = document.createElement("button");
      day.type = "button";
      day.className = "tradition-calendar__day";
      day.setAttribute("role", "gridcell");
      if (date.getMonth() !== month) day.classList.add("tradition-calendar__day--outside");
      if (date.toDateString() === today.toDateString()) day.classList.add("tradition-calendar__day--today");
      const phase = getPhase(date);
      const milestone = getPhaseName(phase);
      day.setAttribute("aria-label", `${date.getDate()} ${monthOnly.format(date)}, ${getSign(date)}${milestone ? `, ${milestone}` : ""}`);
      day.title = `${date.getDate()} ${monthOnly.format(date)} ${date.getFullYear()} · ${locale.startsWith("es") ? "Ver artículos de este mes" : "View this month's articles"}`;
      day.addEventListener("click", () => {
        cursor = new Date(date.getFullYear(), date.getMonth(), 1);
        render();
        selectMonth(date);
        document.querySelector(".tradition-month")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      const dateNumber = document.createElement("span");
      dateNumber.className = "tradition-calendar__date";
      dateNumber.textContent = date.getDate();
      const moon = document.createElement("span");
      moon.className = "tradition-calendar__moon";
      moon.setAttribute("aria-hidden", "true");
      moon.textContent = phases.reduce((best, item) => Math.abs(phase - item.phase) < Math.abs(phase - best.phase) ? item : best).icon;
      const sign = document.createElement("span");
      sign.className = "tradition-calendar__sign";
      sign.textContent = getSign(date);
      day.append(dateNumber, moon, sign);
      grid.append(day);
      if (milestone && date.getMonth() === month) {
        const item = document.createElement("span");
        const strong = document.createElement("strong");
        strong.textContent = `${date.getDate()} ${monthOnly.format(date)}: `;
        item.append(strong, document.createTextNode(milestone));
        key.append(item);
      }
    }
    selectMonth(today);
  };
  root.querySelector("[data-calendar-prev]").addEventListener("click", () => { cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1); render(); });
  root.querySelector("[data-calendar-next]").addEventListener("click", () => { cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); render(); });
  monthSelect.addEventListener("change", () => {
    cursor = new Date(cursor.getFullYear(), Number(monthSelect.value), 1);
    render();
  });
  render();
})();
