"use strict";
// Two data structures: product catalog and stable storage configuration.
const bakeryProducts = [
  { id: "signature-loaf", label: "Signature Loaf" },
  { id: "artisan-bread", label: "Artisan Breads" },
  { id: "cookies", label: "Pastries & Cookies" },
  { id: "cakes", label: "Celebration Cakes" }
];
const storageConfig = { key: "northStarBakeryFavoritesV1", maxItems: bakeryProducts.length };
const validationRules = {
  name: { id: "customer-name", message: "Enter your full name (at least 2 characters)." },
  email: { id: "customer-email", message: "Enter a valid email address." },
  request: { id: "request-type", message: "Choose a request type." },
  details: { id: "item-details", message: "Enter at least 10 characters describing your request." },
  pickup: { id: "pickup-date", message: "Choose a pickup date for pre-orders." }
};
function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageConfig.key) || "[]");
    return Array.isArray(saved) ? saved.filter(id => bakeryProducts.some(item => item.id === id)).slice(0, storageConfig.maxItems) : [];
  } catch (_) { return []; }
}
function saveFavorites(favorites) {
  try { localStorage.setItem(storageConfig.key, JSON.stringify(favorites)); return true; }
  catch (_) { return false; }
}
function renderFavorites() {
  const holder = document.getElementById("favorites-options");
  if (!holder) return;
  const saved = readFavorites();
  holder.replaceChildren();
  bakeryProducts.forEach(product => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "favorite-toggle";
    button.textContent = product.label;
    button.setAttribute("aria-pressed", String(saved.includes(product.id)));
    button.addEventListener("click", () => toggleFavorite(product.id));
    holder.appendChild(button);
  });
  const names = bakeryProducts.filter(item => saved.includes(item.id)).map(item => item.label);
  document.getElementById("favorites-status").textContent = names.length ? `Saved favorites (${names.length}): ${names.join(", ")}.` : "No favorites saved yet. Choose an item above.";
  document.getElementById("favorites-preorder").textContent = names.length ? `Ask about ${names.length} favorite${names.length === 1 ? "" : "s"}` : "Ask about my favorites";
}
function toggleFavorite(id) {
  const favorites = readFavorites();
  const updated = favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id];
  saveFavorites(updated);
  renderFavorites();
}
function setError(field, message) {
  let node = document.getElementById(`${field.id}-error`);
  if (!node) { node = document.createElement("p"); node.className = "field-error"; node.id = `${field.id}-error`; field.insertAdjacentElement("afterend", node); }
  node.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) field.setAttribute("aria-describedby", node.id);
  else field.removeAttribute("aria-describedby");
}
function validateField(field) {
  let error = "";
  if (field.id === validationRules.name.id && field.value.trim().length < 2) error = validationRules.name.message;
  if (field.id === validationRules.email.id && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) error = validationRules.email.message;
  if (field.id === validationRules.request.id && !field.value) error = validationRules.request.message;
  if (field.id === validationRules.details.id && field.value.trim().length < 10) error = validationRules.details.message;
  if (field.id === validationRules.pickup.id && document.getElementById("request-type").value === "preorder" && !field.value) error = validationRules.pickup.message;
  setError(field, error);
  return !error;
}
function initContactForm() {
  const form = document.getElementById("inquiry-form");
  if (!form) return;
  const details = document.getElementById("item-details");
  const savedNames = bakeryProducts.filter(product => readFavorites().includes(product.id)).map(product => product.label);
  if (savedNames.length && !details.value) details.value = `I would like to ask about: ${savedNames.join(", ")}.`;
  const fields = Object.values(validationRules).map(rule => document.getElementById(rule.id));
  fields.forEach(field => {
    field.addEventListener("input", () => { if (field.hasAttribute("aria-invalid")) validateField(field); });
    field.addEventListener("change", () => { if (field.hasAttribute("aria-invalid")) validateField(field); });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const valid = fields.map(validateField).every(Boolean);
    const status = document.getElementById("form-status");
    status.className = valid ? "validation-success" : "validation-error";
    status.textContent = valid ? "Your details passed the checks. Demo only: nothing was sent to the bakery." : "Please correct the highlighted fields before continuing.";
    if (!valid) fields.find(field => field.getAttribute("aria-invalid") === "true").focus();
  });
}
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("favorites-options")) {
    renderFavorites();
    document.getElementById("clear-favorites").addEventListener("click", () => { saveFavorites([]); renderFavorites(); });
  }
  initContactForm();
});
