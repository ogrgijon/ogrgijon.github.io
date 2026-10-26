---
layout: page
title: Tradition
kicker: RITUALS · SEASONS · MEMORY
description: "A living calendar of returning customs, told from Asturias and the family memory of Ourense, Lugo, Asturias, León and Zamora. Latitude and longitude matter: every tradition and observation of the sky belongs to a specific place."
tradition_page: true
lang: en
permalink: /tradition/
translation_url: /es/tradition/
---

<section class="tradition-intro">
  <p class="tradition-intro__index">A YEAR THAT RETURNS <span>—</span> TWELVE THRESHOLDS</p>
  <h2>Time<br>is also <em>celebrated.</em></h2>
  <div class="tradition-intro__orbit" aria-hidden="true"><span></span><i></i><b></b></div>
</section>

<section class="tradition-calendar" aria-labelledby="tradition-calendar-title" data-tradition-calendar>
  <div class="tradition-section-heading">
    <div><p class="eyebrow">THIS MONTH'S SKY</p><h2 id="tradition-calendar-title">Celestial calendar</h2></div>
    <div class="tradition-calendar__controls">
      <button type="button" data-calendar-prev aria-label="Previous month">←</button>
      <p data-calendar-month aria-live="polite"></p>
      <button type="button" data-calendar-next aria-label="Next month">→</button>
    </div>
  </div>
  <p class="tradition-calendar__note">The starting point is Asturias, Spain, within a family memory spanning Ourense, Lugo, Asturias, León and Zamora. Latitude and longitude shape local observation of the Moon and sky; the phases and signs in this calendar are approximate, and dates may vary by time zone.</p>
  <div class="tradition-calendar__legend" aria-label="Legend">
    <span><i class="tradition-legend-moon"></i> New moon</span><span><i class="tradition-legend-quarter"></i> Quarter</span><span><i class="tradition-legend-full"></i> Full moon</span><span><b>♈</b> Solar sign</span>
  </div>
  <div class="tradition-calendar__grid" data-calendar-grid role="grid" aria-label="Lunar and astrological calendar"></div>
  <div class="tradition-calendar__key" data-calendar-key aria-live="polite"></div>
</section>

<section class="tradition-month" aria-labelledby="tradition-month-title">
  <div class="tradition-section-heading">
    <div><p class="eyebrow">CYCLICAL ARCHIVE · <span data-current-month-label>CURRENT MONTH</span></p><h2 id="tradition-month-title">What returns now</h2></div>
  </div>
  <p class="tradition-month__intro">Each October, November or any other month will gather new stories. What was published in previous years remains here: the cycle grows through accumulation.</p>
  <div class="tradition-shelf" data-tradition-shelf>
    {% assign tradition_articles = site.pages | where: "tradition_article", true | sort: "date" | reverse %}
    {% for article in tradition_articles %}
      {% if article.lang == page.lang %}
      <article class="tradition-card" data-tradition-month="{{ article.recurring_month }}">
        <a class="tradition-card__link" href="{{ article.url | relative_url }}">
          {% if article.image %}<img class="tradition-card__image" src="{{ article.image | relative_url }}" alt="" loading="lazy">{% endif %}
          <span class="tradition-card__theme">{{ article.tradition_theme | default: "TRADITION · MEMORY" | escape }}</span>
          <h3>{{ article.title | escape }}</h3>
          <p>{{ article.description | escape }}</p>
          <span class="tradition-card__meta">{{ article.tradition_date | default: article.date | date: "%Y" }} · {{ article.lunar_context | default: "Annual cycle" | escape }}</span>
          <span class="tradition-card__cta">Read the story <b>↗</b></span>
        </a>
      </article>
      {% endif %}
    {% endfor %}
  </div>
  <p class="tradition-empty" data-tradition-empty hidden>There are no stories for this month yet. When the first arrives, this archive will begin to grow.</p>
</section>

<section class="gijon-tides" aria-labelledby="gijon-tides-title" data-gijon-tides data-tide-src="{{ '/assets/data/gijon-tides.xml' | relative_url }}" data-solunar-src="{{ '/assets/data/gijon-solunar.xml' | relative_url }}">
  <div class="tradition-section-heading">
    <div><p class="eyebrow">TIDES · ASTURIAN COAST</p><h2 id="gijon-tides-title">Gijón</h2></div>
    <p class="gijon-tides__coordinates">43.558333° N · 5.698333° W</p>
  </div>
  <p class="gijon-tides__intro">High and low tides based on the official prediction of the Spanish Navy Hydrographic Institute for the port of Gijón. Source local times; heights in metres.</p>
  <p class="gijon-tides__coverage" data-tide-coverage>Official data available: 2026–2027. The IHM has not yet published later years here; no extrapolation is used.</p>
  <p class="gijon-tides__status" data-tide-status role="status" aria-live="polite">Loading official prediction…</p>
  <div class="gijon-tides__legend" aria-label="Fishing activity legend">
    <span><i class="gijon-tides__legend-dot gijon-tides__legend-dot--excellent"></i>Excellent</span>
    <span><i class="gijon-tides__legend-dot gijon-tides__legend-dot--good"></i>Good</span>
    <span><i class="gijon-tides__legend-dot gijon-tides__legend-dot--low"></i>Low</span>
  </div>
  <div class="gijon-tides__sky-legend" aria-label="Sky events">
    <span><i class="gijon-sky-marker gijon-sky-marker--sun"></i>Sunrise / sunset</span>
    <span><i class="gijon-sky-marker gijon-sky-marker--moon"></i>Upper / lower lunar transit</span>
    <span><i class="gijon-sky-marker gijon-sky-marker--solar-noon"></i>Solar transit (noon)</span>
  </div>
  <div class="gijon-tides__chart" data-tide-chart></div>
  <p class="gijon-tides__chart-caption">The curve smooths the path between official high- and low-tide heights; it is not an independent hourly forecast. Upper transit marks culmination over the local meridian, not necessarily an exact passage through the zenith.</p>
  <section class="gijon-fishing" aria-labelledby="gijon-fishing-title">
    <h3 id="gijon-fishing-title">Best times to fish</h3>
    <p class="gijon-fishing__note">Combines solunar periods with active tides: major = ±1 h from lunar transit; minor = ±30 min from moonrise or moonset; tidal movement = ±2 h from high or low tide. Tides and astronomical events are read from local XML files; no external services are queried. Lunar events use an approximate local ephemeris: these windows are indicative and do not guarantee catches.</p>
    <p class="gijon-fishing__status" data-fishing-status role="status" aria-live="polite">Calculating solunar overlaps…</p>
    <ol class="gijon-fishing__list" data-fishing-list></ol>
  </section>
  <ol class="gijon-tides__list" data-tide-list></ol>
  <a class="gijon-tides__source" href="https://armada.defensa.gob.es/ihm/Aplicaciones/Mareas/puerto_mareas.html?puerto=6" target="_blank" rel="noopener noreferrer">Consult the official IHM source <span aria-hidden="true">↗</span></a>
</section>

<p class="tradition-footnote">Merekai begins in Asturias, but family traditions cross Ourense, Lugo, Asturias, León and Zamora. The celestial calendar is a cultural, indicative guide, not a precision ephemeris: exact local coordinates would be needed for local moonrise, moonset or visibility times. Customs also vary from one community to another.</p>
