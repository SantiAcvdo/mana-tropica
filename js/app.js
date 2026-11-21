import { renderHome } from "./views/home.js";
import { renderCombo } from "./views/combo.js";
import {
  renderPaletas,
  refreshPaletasStock
} from "./views/paletas.js";
import { renderAdmin } from "./views/admin.js";
import { closeModal } from "./components/modal.js";
import {
  STOCK_EVENT,
  refreshStock,
  startStockRealtime
} from "./utils/storage.js";

const app = document.getElementById("app");

let inventoryReady = false;
let booting = false;

function getRoute() {
  return window.location.hash.replace("#", "") || "/";
}

function setConnectionNotice(message) {
  const notice = document.getElementById("stock-notice");

  if (notice) {
    notice.textContent = message;
  }
}

function renderRoute() {
  closeModal();

  const route = getRoute();

  if (route === "/combo") {
    renderCombo(app);
    window.scrollTo(0, 0);
    return;
  }

  if (route === "/") {
    renderHome(app);
    window.scrollTo(0, 0);
    return;
  }

  if (!inventoryReady) {
    renderInventoryError();
    return;
  }

  if (route === "/paletas") {
    renderPaletas(app);
    window.scrollTo(0, 0);
    return;
  }

  if (route === "/admin") {
    renderAdmin(app);
    window.scrollTo(0, 0);
    return;
  }

  renderHome(app);
  window.scrollTo(0, 0);
}

function renderInventoryError() {
  app.innerHTML = `
    <header class="topbar">
      <a class="back-button" href="#/">
        <span aria-hidden="true">←</span>
        Inicio
      </a>
      <span class="topbar-title">Inventario</span>
    </header>

    <section class="card">
      <h1>No pudimos cargar el inventario</h1>

      <p>
        Revisa tu conexión a internet e intenta nuevamente.
      </p>

      <button
        id="retry-inventory"
        class="btn btn-primary btn-block"
        type="button"
      >
        Volver a intentar
      </button>
    </section>
  `;

  document
    .getElementById("retry-inventory")
    .addEventListener("click", boot);
}

async function refreshInBackground() {
  if (!inventoryReady || document.hidden) {
    return;
  }

  try {
    await refreshStock();
  } catch {
    setConnectionNotice(
      "No pudimos actualizar el inventario. Revisaremos la disponibilidad antes de enviar tu pedido."
    );
  }
}

async function boot() {
  if (booting) {
    return;
  }

  booting = true;

  app.innerHTML = `
    <section class="card">
      <h1>Maná y Tierra · Trópica</h1>
      <p role="status">Cargando inventario...</p>
    </section>
  `;

  try {
    await refreshStock();

    inventoryReady = true;

    startStockRealtime((status) => {
      if (
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT" ||
        status === "CLOSED"
      ) {
        setConnectionNotice(
          "La conexión en tiempo real se interrumpió. Seguiremos comprobando el inventario periódicamente."
        );
      }
    });
  } catch {
    inventoryReady = false;
  } finally {
    booting = false;
    renderRoute();
  }
}

window.addEventListener("hashchange", renderRoute);

window.addEventListener(STOCK_EVENT, () => {
  if (getRoute() === "/paletas") {
    refreshPaletasStock();
  }
});

window.addEventListener("online", refreshInBackground);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshInBackground();
  }
});

window.setInterval(refreshInBackground, 30000);

boot();