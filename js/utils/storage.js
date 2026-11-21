import { FLAVORS } from "../data/flavors.js";
import { supabase } from "../services/supabase.js";

export const STOCK_EVENT = "tropica:stock-updated";

let stockCache = createEmptyStock();
let realtimeChannel = null;
let refreshPromise = null;

function createEmptyStock() {
  return FLAVORS.reduce((stock, flavor) => {
    stock[flavor.id] = 0;
    return stock;
  }, {});
}

function notifyStockChange() {
  window.dispatchEvent(
    new CustomEvent(STOCK_EVENT, {
      detail: getStock()
    })
  );
}

export function getStock() {
  return { ...stockCache };
}

export function refreshStock() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = loadStock().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function loadStock() {
  const { data, error } = await supabase
    .from("flavor_stock")
    .select("id, stock");

  if (error) {
    throw new Error("No se pudo consultar el inventario.");
  }

  const nextStock = createEmptyStock();

  data.forEach((row) => {
    if (Object.prototype.hasOwnProperty.call(nextStock, row.id)) {
      nextStock[row.id] = row.stock;
    }
  });

  stockCache = nextStock;
  notifyStockChange();

  return getStock();
}

export async function updateFlavorStock(flavorId, quantity) {
  const stock = Number(quantity);

  if (
    !Number.isInteger(stock) ||
    stock < 0 ||
    stock > 100000
  ) {
    throw new Error(
      "El stock debe ser un número entero entre 0 y 100000."
    );
  }

  const { data, error } = await supabase
    .from("flavor_stock")
    .update({ stock })
    .eq("id", flavorId)
    .select("id, stock")
    .single();

  if (error || !data) {
    throw new Error(
      "No se pudo guardar. Verifica tu sesión y tus permisos de administrador."
    );
  }

  stockCache = {
    ...stockCache,
    [data.id]: data.stock
  };

  notifyStockChange();

  return getStock();
}

export function startStockRealtime(onConnectionChange) {
  if (realtimeChannel) {
    return;
  }

  realtimeChannel = supabase
    .channel("tropica-stock-public")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "flavor_stock"
      },
      (payload) => {
        const row = payload.new;
        const previousRow = payload.old;

        if (
          row &&
          Object.prototype.hasOwnProperty.call(stockCache, row.id)
        ) {
          stockCache = {
            ...stockCache,
            [row.id]: row.stock
          };

          notifyStockChange();
          return;
        }

        if (
          payload.eventType === "DELETE" &&
          previousRow &&
          previousRow.id
        ) {
          stockCache = {
            ...stockCache,
            [previousRow.id]: 0
          };

          notifyStockChange();
          return;
        }

        refreshStock().catch(() => {});
      }
    )
    .subscribe((status) => {
      if (typeof onConnectionChange === "function") {
        onConnectionChange(status);
      }

      if (status === "SUBSCRIBED") {
        refreshStock().catch(() => {});
      }
    });
}