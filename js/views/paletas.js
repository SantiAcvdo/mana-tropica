import { FLAVORS, PALETA_PRICE } from "../data/flavors.js";
import { getStock, refreshStock } from "../utils/storage.js";
import { formatCop, openWhatsapp } from "../utils/format.js";
import { openModal, closeModal } from "../components/modal.js";

let cart = {};
let confirmingOrder = false;

export function renderPaletas(container) {
  cart = {};
  confirmingOrder = false;

  container.innerHTML = `
    <header class="topbar">
      <a class="back-button" href="#/">
        <span aria-hidden="true">←</span>
        Inicio
      </a>
      <span class="topbar-title">Trópica Ice Cream</span>
    </header>

    <h1 class="page-title">Paletas Artesanales</h1>

    <p class="page-subtitle">
      Elige tus sabores y arma tu pedido.
    </p>

    <section class="paletas-hero section">
      <img
        class="paletas-image"
        src="./assets/images/paletas-muestra.jpg"
        alt="Fotografías de referencia de paletas artesanales Trópica Ice Cream"
      />

      <span class="paletas-price">
        ${formatCop(PALETA_PRICE)} cada paleta
      </span>
    </section>

    <section class="section">
      <h2 class="section-title">Paletas disponibles</h2>

      <p id="stock-notice" class="card" role="status" aria-live="polite">
        El inventario se actualiza mientras estás en esta página.
      </p>

      <div id="flavor-grid" class="flavor-grid"></div>
    </section>

    <section class="cart-bar">
      <div class="cart-inner">
        <div
          id="cart-summary"
          class="cart-summary"
          aria-live="polite"
        ></div>

        <div
          id="cart-details"
          role="region"
          aria-label="Detalle de las paletas seleccionadas"
          tabindex="0"
        ></div>

        <button
          id="open-order-modal"
          class="btn btn-whatsapp btn-block"
          type="button"
        >
          Pedir paletas seleccionadas
        </button>
      </div>
    </section>
  `;

  refreshPaletasStock();

  document
    .getElementById("open-order-modal")
    .addEventListener("click", openOrderModal);
}

function getSelectedFlavors() {
  return FLAVORS.filter((flavor) => {
    return (cart[flavor.id] || 0) > 0;
  });
}

function getTotalUnits() {
  return getSelectedFlavors().reduce((total, flavor) => {
    return total + cart[flavor.id];
  }, 0);
}

function normalizeCart() {
  const stock = getStock();
  let adjusted = false;

  Object.keys(cart).forEach((id) => {
    const available = stock[id] || 0;

    if (cart[id] > available) {
      adjusted = true;

      if (available === 0) {
        delete cart[id];
      } else {
        cart[id] = available;
      }
    }
  });

  return adjusted;
}

function setStockNotice(message) {
  const notice = document.getElementById("stock-notice");

  if (notice) {
    notice.textContent = message;
  }
}

export function refreshPaletasStock() {
  const grid = document.getElementById("flavor-grid");

  if (!grid) {
    return;
  }

  const adjusted = normalizeCart();

  renderFlavors(grid);
  updateCart();

  if (adjusted) {
    setStockNotice(
      "El inventario cambió. Ajustamos algunas cantidades de tu pedido a las unidades disponibles."
    );
  }
}

function renderFlavors(grid) {
  const stock = getStock();

  const availableFlavors = FLAVORS.filter((flavor) => {
    return stock[flavor.id] > 0;
  });

  grid.innerHTML = "";

  if (availableFlavors.length === 0) {
    grid.innerHTML = `
      <p class="card">
        Por ahora no hay paletas disponibles.
      </p>
    `;

    return;
  }

  availableFlavors.forEach((flavor) => {
    const available = stock[flavor.id];
    const quantity = cart[flavor.id] || 0;

    const card = document.createElement("article");
    card.className = "flavor-card";

    card.innerHTML = `
      <img
        class="flavor-image"
        src="${flavor.image}"
        alt="Paleta artesanal de ${flavor.name}"
        loading="lazy"
      />

      <h3 class="flavor-name">${flavor.name}</h3>

      <p class="flavor-stock ${available <= 3 ? "low" : ""}">
        Quedan ${available}
        ${available === 1 ? "unidad" : "unidades"}
      </p>

      <div class="quantity-controls">
        <button
          class="quantity-button"
          type="button"
          data-action="decrease"
          aria-label="Quitar una paleta de ${flavor.name}"
          ${quantity === 0 ? "disabled" : ""}
        >
          −
        </button>

        <span class="quantity-value" aria-live="polite">
          ${quantity}
        </span>

        <button
          class="quantity-button"
          type="button"
          data-action="increase"
          aria-label="Agregar una paleta de ${flavor.name}"
          ${quantity >= available ? "disabled" : ""}
        >
          +
        </button>
      </div>
    `;

    const decrease = card.querySelector('[data-action="decrease"]');
    const increase = card.querySelector('[data-action="increase"]');
    const value = card.querySelector(".quantity-value");

    function changeQuantity(change) {
      const currentStock = getStock()[flavor.id] || 0;
      const currentQuantity = cart[flavor.id] || 0;

      const nextQuantity = Math.min(
        currentStock,
        Math.max(0, currentQuantity + change)
      );

      if (nextQuantity === 0) {
        delete cart[flavor.id];
      } else {
        cart[flavor.id] = nextQuantity;
      }

      value.textContent = String(nextQuantity);
      decrease.disabled = nextQuantity === 0;
      increase.disabled = nextQuantity >= currentStock;

      updateCart();
    }

    decrease.addEventListener("click", () => {
      changeQuantity(-1);
    });

    increase.addEventListener("click", () => {
      changeQuantity(1);
    });

    grid.appendChild(card);
  });
}

function updateCart() {
  const summary = document.getElementById("cart-summary");
  const details = document.getElementById("cart-details");
  const orderButton = document.getElementById("open-order-modal");

  if (!summary || !details || !orderButton) {
    return;
  }

  const selectedFlavors = getSelectedFlavors();
  const units = getTotalUnits();
  const total = units * PALETA_PRICE;

  summary.textContent = [
    `Llevas ${units} ${units === 1 ? "paleta" : "paletas"}`,
    `Total: ${formatCop(total)}`
  ].join(" • ");

  orderButton.disabled = units === 0;

  if (units === 0) {
    details.innerHTML = `
      <p class="hint">
        Todavía no has seleccionado paletas.
      </p>
    `;

    return;
  }

  details.innerHTML = `
    <ul class="cart-details">
      ${selectedFlavors.map((flavor) => {
        return `
          <li>
            ${flavor.name}: ${cart[flavor.id]} ×
            ${formatCop(PALETA_PRICE)}
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function openOrderModal() {
  if (getTotalUnits() === 0) {
    return;
  }

  openModal({
    title: "Completa tu pedido",
    content: `
      <form id="order-form" class="form-grid">
        <div class="field">
          <label class="label" for="order-address">
            Dirección / Piso
          </label>

          <textarea
            class="textarea"
            id="order-address"
            name="address"
            autocomplete="street-address"
            maxlength="500"
            placeholder="Carrera, número, torre y piso"
            required
          ></textarea>
        </div>

        <div class="field">
          <label class="label" for="order-payment">
            Método de pago
          </label>

          <select
            class="select"
            id="order-payment"
            name="payment"
            required
          >
            <option value="">Selecciona un método</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <p id="order-message" role="alert"></p>
      </form>
    `,
    actions: [
      {
        label: "Cancelar",
        className: "btn-secondary",
        onClick: () => {
          if (!confirmingOrder) {
            closeModal();
          }
        }
      },
      {
        label: "Confirmar y enviar por WhatsApp",
        className: "btn-whatsapp",
        onClick: confirmOrder
      }
    ]
  });

  const form = document.getElementById("order-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    confirmOrder();
  });
}

async function confirmOrder() {
  if (confirmingOrder) {
    return;
  }

  const form = document.getElementById("order-form");

  if (!form || !form.reportValidity()) {
    return;
  }

  const address = form.elements.address.value.trim();
  const payment = form.elements.payment.value;
  const messageElement = document.getElementById("order-message");

  if (!address) {
    messageElement.textContent = "Escribe la dirección de entrega.";
    return;
  }

  const previousCart = JSON.stringify(cart);

  confirmingOrder = true;
  messageElement.textContent = "Comprobando disponibilidad...";

  try {
    await refreshStock();

    if (!form.isConnected) {
      return;
    }

    if (previousCart !== JSON.stringify(cart)) {
      messageElement.textContent =
        "El inventario cambió y ajustamos tu selección. Cierra esta ventana, revisa tu pedido e inténtalo nuevamente.";

      return;
    }

    const selectedFlavors = getSelectedFlavors();
    const units = getTotalUnits();

    if (units === 0) {
      messageElement.textContent =
        "Las paletas seleccionadas ya no están disponibles.";

      return;
    }

    const total = units * PALETA_PRICE;

    const lines = selectedFlavors.map((flavor) => {
      return `- ${flavor.name}: ${cart[flavor.id]}`;
    });

    const message = [
      "Hola, quiero pedir paletas artesanales de Trópica Ice Cream.",
      "",
      "Pedido:",
      ...lines,
      "",
      `Total de paletas: ${units}`,
      `Valor por paleta: ${formatCop(PALETA_PRICE)}`,
      `Total: ${formatCop(total)}`,
      "",
      `Dirección / Piso: ${address}`,
      `Método de pago: ${payment}`,
      "",
      "Quedo pendiente de la confirmación de disponibilidad y entrega. ¡Gracias!"
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/573142947268?text=${encodeURIComponent(message)}`;

    closeModal();
    window.location.assign(whatsappUrl);
  } catch {
    if (messageElement.isConnected) {
      messageElement.textContent =
        "No pudimos comprobar el inventario. Revisa tu conexión e intenta nuevamente.";
    }
  } finally {
    confirmingOrder = false;
  }
}