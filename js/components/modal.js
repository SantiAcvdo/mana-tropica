export function openModal({ title, content, actions = [] }) {
  closeModal();

  const modalRoot = document.getElementById("modal-root");

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("section");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", title);

  const titleElement = document.createElement("h2");
  titleElement.className = "modal-title";
  titleElement.textContent = title;

  const contentElement = document.createElement("div");
  contentElement.className = "modal-content";
  contentElement.innerHTML = content;

  const actionsElement = document.createElement("div");
  actionsElement.className = "modal-actions";

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `btn ${action.className || "btn-secondary"}`;
    button.textContent = action.label;

    button.addEventListener("click", () => {
      if (typeof action.onClick === "function") {
        action.onClick();
      }
    });

    actionsElement.appendChild(button);
  });

  modal.appendChild(titleElement);
  modal.appendChild(contentElement);
  modal.appendChild(actionsElement);
  overlay.appendChild(modal);
  modalRoot.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", handleEscapeKey);

  const firstInput = modal.querySelector("input, select, textarea, button");

  if (firstInput) {
    firstInput.focus();
  }

  return { overlay, modal };
}

function handleEscapeKey(event) {
  if (event.key === "Escape") {
    closeModal();
  }
}

export function closeModal() {
  const modalRoot = document.getElementById("modal-root");
  modalRoot.innerHTML = "";
  document.removeEventListener("keydown", handleEscapeKey);
}