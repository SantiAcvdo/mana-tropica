import { formatCop, openWhatsapp } from "../utils/format.js";

const PRODUCTS = [
  {
    id: "combo",
    name: "Combo original",
    price: 48000
  },
  {
    id: "nachos",
    name: "Nachos solos",
    price: 10000
  },
  {
    id: "guacamole",
    name: "Guacamole solo",
    price: 20000
  },
  {
    id: "pico",
    name: "Pico de Gallo solo",
    price: 18000
  }
];

const MAX_QUANTITY = 100;

export function renderCombo(container) {
  container.innerHTML = `
    <header class="topbar">
      <a class="back-button" href="#/">
        <span aria-hidden="true">←</span>
        Inicio
      </a>

      <span class="topbar-title">Maná y Tierra</span>
    </header>

    <h1 class="page-title">Arma tu pedido</h1>

    <p class="page-subtitle">
      Elige nuestro combo original o compra tus productos por separado.
    </p>

    <section class="card section">
      <img
        class="combo-image"
        src="./assets/images/combo-mana-y-tierra.jpg"
        alt="Combo artesanal de Maná y Tierra con Guacamole, Pico de Gallo y Nachos"
      />

      <div class="combo-product-intro">
        <span class="combo-price">
          Combo original: ${formatCop(48000)}
        </span>

        <h2 class="section-title">¿Qué trae el combo?</h2>

        <ul class="combo-list">
          <li>500 ml de Guacamole.</li>
          <li>500 ml de Pico de Gallo.</li>
          <li>200 g de Nachos Nativos, hechos artesanalmente.</li>
        </ul>

        <p class="combo-highlight">
          Preparación casera, ingredientes frescos y el respaldo de un sabor
          hecho con dedicación para compartir sin preocupaciones.
        </p>
      </div>
    </section>

    <section class="combo-reservation-notice section">
      <h2>Reserva con anticipación</h2>

      <p>
        Se debe reservar con mínimo un día de antelación para tenerlo listo.
      </p>

      <p>
        Solo por encargo: viernes, sábados y domingos.
      </p>
    </section>

    <section class="card section">
      <h2 class="section-title">
        ¿Quieres reservar en un click? Llena esta información:
      </h2>

      <form id="combo-form" class="form-grid">
        <fieldset class="purchase-fieldset">
          <legend class="label">
            1. ¿Qué deseas comprar?
          </legend>

          <div class="purchase-options">
            <label class="purchase-option">
              <input
                type="radio"
                name="purchaseMode"
                value="combo"
                checked
              />

              <span class="purchase-option-content">
                <span class="purchase-option-title">
                  Combo original
                </span>

                <span>
                  Guacamole + Pico de Gallo + Nachos.
                </span>

                <span class="purchase-option-price">
                  ${formatCop(48000)} por combo
                </span>
              </span>
            </label>

            <label class="purchase-option">
              <input
                type="radio"
                name="purchaseMode"
                value="units"
              />

              <span class="purchase-option-content">
                <span class="purchase-option-title">
                  Productos por separado
                </span>

                <span>
                  Elige nachos, guacamole o pico de gallo en las cantidades que quieras.
                </span>

                <span class="purchase-option-price">
                  Desde ${formatCop(10000)}
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset
          id="combo-quantities"
          class="purchase-fieldset"
        >
          <legend class="label">
            2. Elige la cantidad de combos
          </legend>

          <div class="field">
            <label class="label" for="quantity-combo">
              Cantidad de combos
            </label>

            <input
              class="input"
              id="quantity-combo"
              name="comboQuantity"
              type="number"
              inputmode="numeric"
              min="1"
              max="${MAX_QUANTITY}"
              step="1"
              value="1"
              required
            />

            <span class="hint">
              Cada combo cuesta ${formatCop(48000)}.
            </span>
          </div>
        </fieldset>

        <fieldset
          id="units-quantities"
          class="purchase-fieldset"
          hidden
          disabled
        >
          <legend class="label">
            2. Elige tus productos y cantidades
          </legend>

          <p class="hint">
            Escribe 0 en los productos que no quieras pedir.
          </p>

          <div class="individual-products">
            ${createIndividualProductField("nachos")}
            ${createIndividualProductField("guacamole")}
            ${createIndividualProductField("pico")}
          </div>
        </fieldset>

        <section
          class="combo-order-summary"
          aria-labelledby="combo-summary-title"
        >
          <h3 id="combo-summary-title">Así va tu pedido</h3>

          <div
            id="combo-summary-content"
            aria-live="polite"
            aria-atomic="true"
          ></div>
        </section>

        <div class="field">
          <label class="label" for="combo-date">
            Fecha de entrega
          </label>

          <input
            class="input"
            id="combo-date"
            name="date"
            type="date"
            required
          />

          <span class="hint">
            Reserva desde mañana. Las entregas son viernes, sábados y domingos.
          </span>
        </div>

        <div class="form-row">
          <div class="field">
            <label class="label" for="combo-hour">
              Hora
            </label>

            <select
              class="select"
              id="combo-hour"
              name="hour"
              required
            >
              <option value="">Selecciona la hora</option>
            </select>
          </div>

          <div class="field">
            <label class="label" for="combo-meridiem">
              AM o PM
            </label>

            <select
              class="select"
              id="combo-meridiem"
              name="meridiem"
              required
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label" for="combo-address">
            Dirección / Piso
          </label>

          <textarea
            class="textarea"
            id="combo-address"
            name="address"
            maxlength="500"
            autocomplete="street-address"
            placeholder="Ejemplo: Carrera 43A #75 Sur 05, Torre 1, Piso 120"
            required
          ></textarea>
        </div>

        <p
          id="combo-form-message"
          class="combo-form-message"
          role="alert"
        ></p>

        <button
          class="btn btn-whatsapp btn-block"
          type="submit"
        >
          Reservar por WhatsApp
        </button>

        <p class="hint">
          Tu reserva queda pendiente de confirmación por WhatsApp.
        </p>
      </form>
    </section>
  `;

  const form = document.getElementById("combo-form");

  fillHourOptions(form);
  setMinimumDate(form);
  setupPurchaseMode(form);
  setupLiveSummary(form);
  setupDateValidation(form);
  setupFormSubmission(form);
  updateSummary(form);
}

function createIndividualProductField(productId) {
  const product = PRODUCTS.find((item) => item.id === productId);

  return `
    <div class="individual-product">
      <div class="individual-product-info">
        <label
          class="label"
          for="quantity-${product.id}"
        >
          ${product.name}
        </label>

        <span class="individual-product-price">
          ${formatCop(product.price)} por unidad
        </span>
      </div>

      <div class="field">
        <label
          class="individual-quantity-label"
          for="quantity-${product.id}"
        >
          Cantidad
        </label>

        <input
          class="input individual-quantity-input"
          id="quantity-${product.id}"
          name="${product.id}Quantity"
          type="number"
          inputmode="numeric"
          min="0"
          max="${MAX_QUANTITY}"
          step="1"
          value="0"
          required
        />
      </div>
    </div>
  `;
}

function getPurchaseMode(form) {
  return form.elements.purchaseMode.value;
}

function getQuantity(form, productId) {
  const input = form.querySelector(`#quantity-${productId}`);
  const value = Number(input.value);

  if (
    !Number.isInteger(value) ||
    value < 0 ||
    value > MAX_QUANTITY
  ) {
    return 0;
  }

  return value;
}

function getOrderItems(form) {
  const mode = getPurchaseMode(form);

  const selectedProducts = mode === "combo"
    ? PRODUCTS.filter((product) => product.id === "combo")
    : PRODUCTS.filter((product) => product.id !== "combo");

  return selectedProducts
    .map((product) => {
      const quantity = getQuantity(form, product.id);

      return {
        ...product,
        quantity,
        subtotal: quantity * product.price
      };
    })
    .filter((product) => product.quantity > 0);
}

function getOrderTotal(items) {
  return items.reduce((total, item) => {
    return total + item.subtotal;
  }, 0);
}

function setupPurchaseMode(form) {
  const modeInputs = form.querySelectorAll(
    'input[name="purchaseMode"]'
  );

  const comboFieldset = document.getElementById("combo-quantities");
  const unitsFieldset = document.getElementById("units-quantities");

  modeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const isCombo = getPurchaseMode(form) === "combo";

      comboFieldset.hidden = !isCombo;
      comboFieldset.disabled = !isCombo;

      unitsFieldset.hidden = isCombo;
      unitsFieldset.disabled = isCombo;

      clearFormMessage();
      updateSummary(form);
    });
  });
}

function setupLiveSummary(form) {
  form.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("input", () => {
      clearFormMessage();
      updateSummary(form);
    });
  });
}

function updateSummary(form) {
  const summary = document.getElementById("combo-summary-content");
  const items = getOrderItems(form);
  const total = getOrderTotal(items);

  const detail = items.length > 0
    ? `
      <ul class="combo-summary-list">
        ${items.map((item) => {
          return `
            <li>
              <span>
                ${item.name}: ${item.quantity} × ${formatCop(item.price)}
              </span>

              <span class="combo-summary-subtotal">
                ${formatCop(item.subtotal)}
              </span>
            </li>
          `;
        }).join("")}
      </ul>
    `
    : `
      <p class="combo-summary-empty">
        Selecciona al menos un producto para armar tu pedido.
      </p>
    `;

  summary.innerHTML = `
    ${detail}

    <p class="combo-summary-total">
      <span>Total de productos</span>
      <span>${formatCop(total)}</span>
    </p>
  `;
}

function fillHourOptions(form) {
  const select = form.elements.hour;

  for (let hour = 1; hour <= 12; hour += 1) {
    ["00", "30"].forEach((minutes) => {
      const option = document.createElement("option");
      const time = `${hour}:${minutes}`;

      option.value = time;
      option.textContent = time;

      select.appendChild(option);
    });
  }
}

function getTomorrowDateString() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function setMinimumDate(form) {
  form.elements.date.min = getTomorrowDateString();
}

function validateReservationDate(form) {
  const input = form.elements.date;
  const value = input.value;

  setMinimumDate(form);
  input.setCustomValidity("");

  if (!value) {
    return;
  }

  if (value < input.min) {
    input.setCustomValidity(
      "Debes reservar con mínimo un día de antelación. Selecciona una fecha desde mañana."
    );

    return;
  }

  const selectedDate = new Date(`${value}T12:00:00`);
  const day = selectedDate.getDay();

  if (![5, 6, 0].includes(day)) {
    input.setCustomValidity(
      "Las entregas se realizan únicamente los viernes, sábados y domingos."
    );
  }
}

function setupDateValidation(form) {
  const dateInput = form.elements.date;

  dateInput.addEventListener("input", () => {
    validateReservationDate(form);
    clearFormMessage();
  });

  dateInput.addEventListener("change", () => {
    validateReservationDate(form);
  });
}

function clearFormMessage() {
  const message = document.getElementById("combo-form-message");

  if (message) {
    message.textContent = "";
  }
}

function setupFormSubmission(form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    clearFormMessage();
    validateReservationDate(form);

    if (!form.reportValidity()) {
      return;
    }

    const items = getOrderItems(form);
    const messageElement = document.getElementById("combo-form-message");

    if (items.length === 0) {
      messageElement.textContent =
        "Selecciona al menos un producto con cantidad mayor a 0.";

      const firstQuantity = getPurchaseMode(form) === "combo"
        ? document.getElementById("quantity-combo")
        : document.getElementById("quantity-nachos");

      firstQuantity.focus();
      return;
    }

    const address = form.elements.address.value.trim();

    if (!address) {
      messageElement.textContent =
        "Escribe la dirección y el piso para tu entrega.";

      form.elements.address.focus();
      return;
    }

    const mode = getPurchaseMode(form);
    const total = getOrderTotal(items);

    const formattedDate = new Date(
      `${form.elements.date.value}T12:00:00`
    ).toLocaleDateString("es-CO", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const productLines = items.map((item) => {
      return [
        `- ${item.name}`,
        `Cantidad: ${item.quantity}`,
        `Precio unitario: ${formatCop(item.price)}`,
        `Subtotal: ${formatCop(item.subtotal)}`
      ].join("\n");
    });

    const message = [
      "Hola, quiero hacer una reserva en Maná y Tierra.",
      "",
      `Tipo de compra: ${
        mode === "combo" ? "Combo original" : "Productos por separado"
      }`,
      "",
      "Mi pedido:",
      "",
      productLines.join("\n\n"),
      "",
      `Total de productos: ${formatCop(total)}`,
      "",
      `Fecha de entrega: ${formattedDate}`,
      `Hora: ${form.elements.hour.value} ${form.elements.meridiem.value}`,
      `Dirección / Piso: ${address}`,
      "",
      "Quedo pendiente de la confirmación de mi reserva. ¡Gracias!"
    ].join("\n");

    openWhatsapp(message);
  });
}