---
layout: page
title: Tradición
kicker: RITOS · ESTACIONES · MEMORIA
description: "Un calendario vivo de costumbres que regresan, contado desde Asturias y la memoria familiar de Ourense, Lugo, Asturias, León y Zamora. La latitud y la longitud importan: cada tradición y cada observación del cielo pertenecen a un lugar concreto."
tradition_page: true
lang: es
permalink: /es/tradition/
translation_url: /tradition/
---

<section class="tradition-intro">
  <p class="tradition-intro__index">UN AÑO QUE VUELVE <span>—</span> DOCE UMBRALES</p>
  <h2>El tiempo<br>también <em>se celebra.</em></h2>
  <div class="tradition-intro__orbit" aria-hidden="true"><span></span><i></i><b></b></div>
</section>

<section class="tradition-calendar" aria-labelledby="tradition-calendar-title" data-tradition-calendar>
  <div class="tradition-section-heading">
    <div><p class="eyebrow">EL CIELO DE ESTE MES</p><h2 id="tradition-calendar-title">Calendario celeste</h2></div>
    <div class="tradition-calendar__controls">
      <button type="button" data-calendar-prev aria-label="Mes anterior">←</button>
      <p data-calendar-month aria-live="polite"></p>
      <button type="button" data-calendar-next aria-label="Mes siguiente">→</button>
    </div>
  </div>
  <p class="tradition-calendar__note">El punto de partida es Asturias (España), dentro de una memoria familiar que abarca Ourense, Lugo, Asturias, León y Zamora. La latitud y la longitud condicionan la observación local de la Luna y el cielo; las fases y los signos de este calendario son aproximados y las fechas pueden variar según la zona horaria.</p>
  <div class="tradition-calendar__legend" aria-label="Leyenda">
    <span><i class="tradition-legend-moon"></i> Luna nueva</span><span><i class="tradition-legend-quarter"></i> Cuarto</span><span><i class="tradition-legend-full"></i> Luna llena</span><span><b>♈</b> Signo solar</span>
  </div>
  <div class="tradition-calendar__grid" data-calendar-grid role="grid" aria-label="Calendario lunar y astrológico"></div>
  <div class="tradition-calendar__key" data-calendar-key aria-live="polite"></div>
</section>

<section class="tradition-month" aria-labelledby="tradition-month-title">
  <div class="tradition-section-heading">
    <div><p class="eyebrow">ARCHIVO CÍCLICO · <span data-current-month-label>MES EN CURSO</span></p><h2 id="tradition-month-title">Lo que vuelve ahora</h2></div>
  </div>
  <p class="tradition-month__intro">Cada octubre, noviembre o cualquier otro mes irá sumando nuevas historias. Lo publicado en años anteriores permanece aquí: el ciclo crece por acumulación.</p>
  <div class="tradition-shelf" data-tradition-shelf>
    {% assign tradition_articles = site.pages | where: "tradition_article", true | sort: "date" | reverse %}
    {% for article in tradition_articles %}
      {% if article.lang == page.lang %}
      <article class="tradition-card" data-tradition-month="{{ article.recurring_month }}">
        <a class="tradition-card__link" href="{{ article.url | relative_url }}">
          {% if article.image %}<img class="tradition-card__image" src="{{ article.image | relative_url }}" alt="" loading="lazy">{% endif %}
          <span class="tradition-card__theme">{{ article.tradition_theme | default: "TRADICIÓN · MEMORIA" | escape }}</span>
          <h3>{{ article.title | escape }}</h3>
          <p>{{ article.description | escape }}</p>
          <span class="tradition-card__meta">{{ article.tradition_date | default: article.date | date: "%Y" }} · {{ article.lunar_context | default: "Ciclo anual" | escape }}</span>
          <span class="tradition-card__cta">Leer la historia <b>↗</b></span>
        </a>
      </article>
      {% endif %}
    {% endfor %}
  </div>
  <p class="tradition-empty" data-tradition-empty hidden>Aún no hay historias para este mes. Cuando llegue la primera, este archivo empezará a crecer.</p>
</section>

<section class="gijon-tides" aria-labelledby="gijon-tides-title" data-gijon-tides data-tide-src="{{ '/assets/data/gijon-tides.xml' | relative_url }}" data-solunar-src="{{ '/assets/data/gijon-solunar.xml' | relative_url }}">
  <div class="tradition-section-heading">
    <div><p class="eyebrow">MAREAS · COSTA ASTURIANA</p><h2 id="gijon-tides-title">Gijón</h2></div>
    <p class="gijon-tides__coordinates">43.558333° N · 5.698333° O</p>
  </div>
  <p class="gijon-tides__intro">Pleamares y bajamares según la predicción oficial del Instituto Hidrográfico de la Marina para el puerto de Gijón. Horas locales de la fuente y alturas en metros.</p>
  <p class="gijon-tides__coverage" data-tide-coverage>Datos oficiales disponibles: 2026–2027. El IHM aún no publica aquí los años siguientes; no se extrapolan.</p>
  <p class="gijon-tides__status" data-tide-status role="status" aria-live="polite">Cargando predicción oficial…</p>
  <div class="gijon-tides__legend" aria-label="Leyenda de actividad de pesca">
    <span><i class="gijon-tides__legend-dot gijon-tides__legend-dot--excellent"></i>Excelente</span>
    <span><i class="gijon-tides__legend-dot gijon-tides__legend-dot--good"></i>Buena</span>
    <span><i class="gijon-tides__legend-dot gijon-tides__legend-dot--low"></i>Baja</span>
  </div>
  <div class="gijon-tides__sky-legend" aria-label="Eventos del cielo">
    <span><i class="gijon-sky-marker gijon-sky-marker--sun"></i>Amanecer / atardecer</span>
    <span><i class="gijon-sky-marker gijon-sky-marker--moon"></i>Tránsitos lunares superior / inferior</span>
    <span><i class="gijon-sky-marker gijon-sky-marker--solar-noon"></i>Tránsito solar (mediodía)</span>
  </div>
  <div class="gijon-tides__chart" data-tide-chart></div>
  <p class="gijon-tides__chart-caption">La curva suaviza el recorrido entre las alturas oficiales de pleamar y bajamar; no representa una predicción horaria independiente. El tránsito superior marca la culminación sobre el meridiano local, no necesariamente el paso exacto por el cénit.</p>
  <section class="gijon-fishing" aria-labelledby="gijon-fishing-title">
    <h3 id="gijon-fishing-title">Mejores momentos para pescar</h3>
    <p class="gijon-fishing__note">Cruza periodos solunares con mareas activas: mayor = ±1 h del tránsito lunar; menor = ±30 min de salida o puesta de Luna; movimiento de marea = ±2 h de pleamar o bajamar. Mareas y eventos astronómicos se leen de XML locales; no se consultan servicios externos. Los eventos lunares se calculan con una efeméride local aproximada: las ventanas son orientativas, no garantizan capturas.</p>
    <p class="gijon-fishing__status" data-fishing-status role="status" aria-live="polite">Calculando coincidencias solunares…</p>
    <ol class="gijon-fishing__list" data-fishing-list></ol>
  </section>
  <ol class="gijon-tides__list" data-tide-list></ol>
  <a class="gijon-tides__source" href="https://armada.defensa.gob.es/ihm/Aplicaciones/Mareas/puerto_mareas.html?puerto=6" target="_blank" rel="noopener noreferrer">Consultar fuente oficial del IHM <span aria-hidden="true">↗</span></a>
</section>

<p class="tradition-footnote">Merekai nace en Asturias, pero las tradiciones familiares atraviesan Ourense, Lugo, Asturias, León y Zamora. El calendario celeste es una guía cultural y orientativa, no una fuente de efemérides de precisión: para horas locales de salida, puesta o visibilidad lunar harían falta las coordenadas exactas de cada lugar. Las costumbres también cambian de una comunidad a otra.</p>
