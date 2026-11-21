import { formatCop, openWhatsapp } from "../utils/format.js";

const COMBO_PRICE = 48000;

export function renderCombo(container) {
  container.innerHTML = `
    <header class="topbar">
      <a class="back-button" href="#/">
        <span aria-hidden="true">←</span>
        Inicio
      </a>
      <span class="topbar-title">Maná y Tierra</span>
    </header>

    <h1 class="page-title">Combo de Nachos</h1>
    <p class="page-subtitle">Ideal para compartir, fresco y hecho con dedicación.</p>

    <section class="card section">
      <img
        class="combo-image"
        src="./assets/images/combo-mana-y-tierra.jpg"
        alt="Imagen publicitaria del Combo de Nachos de Maná y Tierra"
      />

      <span class="combo-price">${formatCop(COMBO_PRICE)}</span>

      <h2 class="section-title">¿Qué trae el combo?</h2>
      <p>
        Combo artesanal que incluye:
      </p>

      <ul class="combo-list">
        <li>500 ml de Guacamole.</li>
        <li>500 ml de Pico de Gallo.</li>
        <li>200 g de Nachos Nativos, hechos artesanalmente.</li>
      </ul>

      <p class="combo-highlight">
        Preparación casera, ingredientes frescos y el respaldo de un sabor
        hecho con dedicación para compartir sin preocupaciones.
      </p>
    </section>

    <section class="section">
      <p class="combo-warning">
        Solo por encargo: Viernes, Sábados y Domingos.
      </p>
    </section>

    <section class="card section">
      <h2 class="section-title">¿Quieres reservar en un click? Llena esta información:</h2>

      <form id="combo-form" class="form-grid" novalidate>
        <div class="field">
          <label class="label" for="combo-quantity">Cantidad de combos</label>
          <input
            class="input"
            id="combo-quantity"
            name="quantity"
            type="number"
            inputmode="numeric"
            min="1"
            max="50"
            step="1"
            value="1"
            required
          />
          <span class="hint">Ejemplo: 2</span>
        </div>

        <div class="field">
          <label class="label" for="combo-date">Fecha</label>
          <input
            class="input"
            id="combo-date"
            name="date"
            type="date"
            required
          />
          <span class="hint">Ejemplo: 02/12</span>
        </div>

        <div class="form-row">
          <div class="field">
            <label class="label" for="combo-hour">Hora</label>
            <select class="select" id="combo-hour" name="hour" required>
              <option value="">Selecciona la hora</option>
            </select>
          </div>

          <div class="field">
            <label class="label" for="combo-meridiem">AM o PM</label>
            <select class="select" id="combo-meridiem" name="meridiem" required>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="label" for="combo-address">Dirección / Piso</label>
          <textarea
            class="textarea"
            id="combo-address"
            name="address"
            placeholder="Ejemplo: Carrera 43A #75 Sur 05, Torre 1, Piso 120"
            required
          ></textarea>
        </div>

        <button class="btn btn-whatsapp btn-block" type="submit">
          Reservar por WhatsApp
        </button>
      </form>
    </section>
  `;

  fillHourOptions();
  setMinimumDate();
  handleComboForm();
}

function fillHourOptions() {
  const hourSelect = document.getElementById("combo-hour");
  const hours = [];

  for (let hour = 1; hour <= 12; hour += 1) {
    hours.push(`${hour}:00`);
    hours.push(`${hour}:30`);
  }

  hours.forEach((hour) => {
    const option = document.createElement("option");
    option.value = hour;
    option.textContent = hour;
    hourSelect.appendChild(option);
  });
}

function setMinimumDate() {
  const dateInput = document.getElementById("combo-date");
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.min = `${year}-${month}-${day}`;
}

function handleComboForm() {
  const form = document.getElementById("combo-form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const quantity = Number(form.quantity.value);
    const date = form.date.value;
    const hour = form.hour.value;
    const meridiem = form.meridiem.value;
    const address = form.address.value.trim();

    if (!quantity || quantity < 1) {
      alert("Por favor escribe una cantidad válida.");
      return;
    }

    if (!date || !hour || !address) {
      alert("Por favor completa la fecha, la hora y la dirección.");
      return;
    }

    const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const total = quantity * COMBO_PRICE;

    const message = [
      "Hola, quiero reservar un Combo de Nachos de Maná y Tierra.",
      "",
      `Cantidad: ${quantity}`,
      `Fecha: ${formattedDate}`,
      `Hora: ${hour} ${meridiem}`,
      `Dirección / Piso: ${address}`,
      "",
      `Valor total: ${formatCop(total)}`,
      "",
      "Quedo pendiente de la confirmación. ¡Gracias!"
    ].join("\n");

    openWhatsapp(message);
  });
}