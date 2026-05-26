import { t } from '../i18n/index.js';

let _errorCounter = 0;

export function showFieldError(el, msg) {
  el.classList.add("error");
  el.closest(".form-group")?.classList.add("has-error");
  let err = el.parentNode.querySelector(".form-error");
  if (!err) {
    err = document.createElement("div");
    err.className = "form-error";
    const errId = `fe-${++_errorCounter}`;
    err.id = errId;
    el.setAttribute("aria-describedby", errId);
    el.parentNode.appendChild(err);
  }
  err.textContent = msg;
}

export function clearFieldError(el) {
  el.classList.remove("error");
  el.removeAttribute("aria-describedby");
  el.closest(".form-group")?.classList.remove("has-error");
  const err = el.parentNode.querySelector(".form-error");
  if (err) err.remove();
}

export function clearAllFieldErrors(formEl) {
  formEl
    .querySelectorAll(
      ".form-input.error, .form-select.error, .form-textarea.error",
    )
    .forEach(clearFieldError);
}

export function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: "common.weak", class: "weak" };
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: "common.weak", class: "weak" };
  if (score <= 4) return { score, label: "common.medium", class: "medium" };
  return { score, label: "common.strong", class: "strong" };
}

export function validateForm(formId, rules) {
  const form = document.getElementById(formId);
  if (!form) return true;
  let valid = true;
  clearAllFieldErrors(form);

  for (const [fieldId, checks] of Object.entries(rules)) {
    const field = document.getElementById(fieldId);
    if (!field) continue;
    const value = (field.value || "").trim();
    for (const check of checks) {
      if (check.required && !value) {
        showFieldError(field, check.message || t("validation.required"));
        valid = false;
        break;
      }
      if (
        check.minLength != null &&
        value.length < check.minLength
      ) {
        showFieldError(field, check.message || t("validation.minLength"));
        valid = false;
        break;
      }
      if (check.pattern && !check.pattern.test(value)) {
        showFieldError(field, check.message || t("validation.invalid"));
        valid = false;
        break;
      }
      if (check.custom && !check.custom(value, form)) {
        showFieldError(field, check.message || t("validation.invalid"));
        valid = false;
        break;
      }
    }
  }
  return valid;
}

export function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
