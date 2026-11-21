export function formatCop(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatWhatsappText(text) {
  return encodeURIComponent(text);
}

export function openWhatsapp(message) {
  const phone = "573142947268";
  const url = `https://wa.me/${phone}?text=${formatWhatsappText(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}