export function renderHome(container) {
  container.innerHTML = `
    <section class="home-hero">
      <h1 class="page-title">¿Qué deseas?</h1>
      <p class="page-subtitle">
        Elige una opción para continuar. Puedes volver al inicio en cualquier momento.
      </p>
    </section>

    <section class="home-options" aria-label="Opciones principales">
      <a
        class="home-option home-option-combo"
        href="#/combo"
      >
        <span class="home-option-icon" aria-hidden="true">🥑</span>
        <h2 class="home-option-title">Maná y Tierra</h2>
        <p class="home-option-text">
          Combo de Pico de Gallo, Guacamole y Nachos.
        </p>
        <span class="home-option-cta">Ver combo y reservar</span>
      </a>

      <a
        class="home-option home-option-paletas"
        href="#/paletas"
      >
        <span class="home-option-icon" aria-hidden="true">🍦</span>
        <h2 class="home-option-title">Trópica Ice Cream</h2>
        <p class="home-option-text">
          ¿O quieres refrescarte viendo qué paletas hay disponibles?
        </p>
        <span class="home-option-cta">Ver paletas disponibles</span>
      </a>
    </section>

    <section class="home-note">
      Paletas artesanales a $2.500 COP cada una.
    </section>
  `;
}