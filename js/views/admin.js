import { FLAVORS } from "../data/flavors.js";
import { supabase } from "../services/supabase.js";
import {
  getStock,
  refreshStock,
  updateFlavorStock
} from "../utils/storage.js";

let renderVersion = 0;

export async function renderAdmin(container) {
  const version = ++renderVersion;

  container.innerHTML = `
    <header class="topbar">
      <a class="back-button" href="#/">
        <span aria-hidden="true">←</span>
        Inicio
      </a>
      <span class="topbar-title">Administrador</span>
    </header>

    <section class="card">
      <p role="status">Comprobando sesión...</p>
    </section>
  `;

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (version !== renderVersion || !isAdminRoute()) {
      return;
    }

    if (session && await isAuthorizedAdmin()) {
      if (version === renderVersion && isAdminRoute()) {
        renderAdminPanel(container);
      }

      return;
    }

    if (version === renderVersion && isAdminRoute()) {
      renderLogin(container);
    }
  } catch {
    if (version === renderVersion && isAdminRoute()) {
      renderLogin(container);
    }
  }
}

function isAdminRoute() {
  return window.location.hash === "#/admin";
}

async function isAuthorizedAdmin() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

function renderLogin(container) {
  container.innerHTML = `
    <header class="topbar">
      <a class="back-button" href="#/">
        <span aria-hidden="true">←</span>
        Inicio
      </a>
      <span class="topbar-title">Administrador</span>
    </header>

    <section class="card admin-login">
      <h1>Acceso administrador</h1>

      <p>
        Ingresa con tu correo y contraseña para administrar el inventario.
      </p>

      <form id="admin-login-form" class="form-grid">
        <div class="field">
          <label class="label" for="admin-email">
            Correo electrónico
          </label>

          <input
            class="input"
            id="admin-email"
            name="email"
            type="email"
            autocomplete="username"
            required
          />
        </div>

        <div class="field">
          <label class="label" for="admin-password">
            Contraseña
          </label>

          <input
            class="input"
            id="admin-password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <p id="admin-login-message" role="alert"></p>

        <button
          id="admin-login-button"
          class="btn btn-primary btn-block"
          type="submit"
        >
          Iniciar sesión
        </button>
      </form>
    </section>
  `;

  const form = document.getElementById("admin-login-form");
  const button = document.getElementById("admin-login-button");
  const message = document.getElementById("admin-login-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    button.disabled = true;
    button.textContent = "Ingresando...";
    message.textContent = "";

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.elements.email.value.trim(),
        password: form.elements.password.value
      });

      if (error) {
        throw new Error(
          "No se pudo iniciar sesión. Revisa el correo y la contraseña."
        );
      }

      if (!await isAuthorizedAdmin()) {
        await supabase.auth.signOut();

        throw new Error(
          "Esta cuenta no tiene permisos de administrador."
        );
      }

      await refreshStock();

      if (isAdminRoute()) {
        renderAdminPanel(container);
      }
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
      button.textContent = "Iniciar sesión";
    }
  });
}

function renderAdminPanel(container) {
  container.innerHTML = `
    <header class="topbar">
      <a class="back-button" href="#/">
        <span aria-hidden="true">←</span>
        Inicio
      </a>
      <span class="topbar-title">Stock de paletas</span>
    </header>

    <section class="section">
      <h1 class="page-title">Administrador de stock</h1>

      <p class="page-subtitle">
        Los cambios se guardan en Supabase y se comparten con los clientes.
      </p>

      <div class="admin-actions">
        <button
          id="admin-refresh-stock"
          class="btn btn-secondary"
          type="button"
        >
          Actualizar inventario
        </button>

        <button
          id="admin-logout"
          class="btn btn-danger"
          type="button"
        >
          Cerrar sesión
        </button>
      </div>

      <p id="admin-status" class="card" role="status">
        Cambia una cantidad y pulsa Guardar.
      </p>

      <div id="admin-list" class="admin-list"></div>
    </section>
  `;

  renderStockList();

  document
    .getElementById("admin-refresh-stock")
    .addEventListener("click", async () => {
      try {
        await refreshStock();

        if (!isAdminRoute()) {
          return;
        }

        renderStockList();
        setAdminStatus("Inventario actualizado.");
      } catch (error) {
        setAdminStatus(error.message);
      }
    });

  document
    .getElementById("admin-logout")
    .addEventListener("click", async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAdminStatus("No se pudo cerrar la sesión. Intenta nuevamente.");
        return;
      }

      if (isAdminRoute()) {
        renderLogin(container);
      }
    });
}

function setAdminStatus(message) {
  const status = document.getElementById("admin-status");

  if (status) {
    status.textContent = message;
  }
}

function renderStockList() {
  const list = document.getElementById("admin-list");

  if (!list) {
    return;
  }

  const stock = getStock();

  list.innerHTML = "";

  FLAVORS.forEach((flavor) => {
    const currentStock = stock[flavor.id] || 0;

    const item = document.createElement("article");
    item.className = "admin-item";

    item.innerHTML = `
      <div class="admin-item-info">
        <img
          class="admin-thumb"
          src="${flavor.image}"
          alt="Paleta de ${flavor.name}"
          loading="lazy"
        />

        <div>
          <h2 class="admin-name">${flavor.name}</h2>
          <p class="admin-category">${flavor.category}</p>
        </div>
      </div>

      <div class="admin-controls">
        <label class="sr-only" for="stock-${flavor.id}">
          Stock de ${flavor.name}
        </label>

        <input
          class="stock-input"
          id="stock-${flavor.id}"
          type="number"
          inputmode="numeric"
          min="0"
          max="100000"
          step="1"
          value="${currentStock}"
        />

        <button
          class="btn btn-primary"
          type="button"
          data-action="save"
        >
          Guardar
        </button>

        <button
          class="availability-toggle"
          type="button"
          data-action="unavailable"
        >
          Agotar
        </button>
      </div>
    `;

    const input = item.querySelector("input");
    const saveButton = item.querySelector('[data-action="save"]');
    const unavailableButton = item.querySelector(
      '[data-action="unavailable"]'
    );

    async function saveQuantity(quantity) {
      saveButton.disabled = true;
      unavailableButton.disabled = true;
      input.disabled = true;

      try {
        await updateFlavorStock(flavor.id, quantity);

        input.value = String(quantity);

        setAdminStatus(
          `Stock de ${flavor.name} guardado: ${quantity} unidades.`
        );
      } catch (error) {
        setAdminStatus(error.message);
      } finally {
        saveButton.disabled = false;
        unavailableButton.disabled = false;
        input.disabled = false;
      }
    }

    saveButton.addEventListener("click", () => {
      if (!input.reportValidity()) {
        return;
      }

      saveQuantity(Number(input.value));
    });

    unavailableButton.addEventListener("click", () => {
      saveQuantity(0);
    });

    list.appendChild(item);
  });
}