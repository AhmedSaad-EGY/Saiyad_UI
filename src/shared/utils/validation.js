import { t } from './i18n.js';

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

export function getPasswordStrengthResult(password) {
  let score = 0;
  if (!password) return { score: 0, label: "auth.veryWeak", cls: "very-weak" };
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "auth.veryWeak", cls: "very-weak" };
  if (score <= 3) return { score, label: "auth.weak", cls: "weak" };
  if (score <= 4) return { score, label: "auth.fair", cls: "fair" };
  if (score <= 5) return { score, label: "auth.strong", cls: "strong" };
  return { score, label: "auth.veryStrong", cls: "very-strong" };
}

export function validateForm(formIdOrEl, rules) {
  // Accept either a string ID or a DOM element
  const form = (typeof formIdOrEl === 'string')
    ? document.getElementById(formIdOrEl)
    : formIdOrEl;
  if (!form) {
    console.warn("Validation target form element not found.");
    return false;
  }
  let valid = true;
  clearAllFieldErrors(form);

  // Support both formats:
  // Format A (object): { fieldId: [checks] }    ← used by standalone calls
  // Format B (array):  [{ element, required, messages }]  ← used by register.js
  const ruleEntries = Array.isArray(rules)
    ? rules.map((r) => [r.element?.id || "", [r]])
    : Object.entries(rules);

  for (const [fieldId, checks] of ruleEntries) {
    const field =
      typeof fieldId === "string" && fieldId
        ? form.querySelector(`#${fieldId}`) || document.getElementById(fieldId)
        : null;
    // For array format, the element is already in the check object
    const resolvedField =
      field || (Array.isArray(rules) ? checks[0]?.element : null);
    if (!resolvedField) continue;
    const value = (resolvedField.value || "").trim();
    for (const check of checks) {
      if (check.required && !value) {
        const msg =
          check.message || check.messages?.required || t("validation.required");
        showFieldError(resolvedField, msg);
        valid = false;
        break;
      }
      if (check.minLength != null && value.length < check.minLength) {
        const msg =
          check.message || check.messages?.minLength || t("validation.minLength");
        showFieldError(resolvedField, msg);
        valid = false;
        break;
      }
      if (check.pattern && !check.pattern.test(value)) {
        const msg =
          check.message || check.messages?.pattern || t("validation.invalid");
        showFieldError(resolvedField, msg);
        valid = false;
        break;
      }
      if (check.matches) {
        const matchEl = check.matches.element;
        if (!matchEl || matchEl.value === undefined) {
          const msg = check.messages?.matches || t("validation.invalid");
          showFieldError(resolvedField, msg);
          valid = false;
          break;
        }
        const matchVal = (matchEl.value || "").trim();
        if (value !== matchVal) {
          const msg = check.messages?.matches || t("validation.invalid");
          showFieldError(resolvedField, msg);
          valid = false;
          break;
        }
      }
      if (check.minAge != null) {
        const age = calculateAge(value);
        if (isNaN(age) || age < check.minAge) {
          const msg =
            check.messages?.minAge ||
            t('validation.minAge', { minAge: check.minAge });
          showFieldError(resolvedField, msg);
          valid = false;
          break;
        }
      }
      if (check.phone && value && !/^[+\d][\d\s\-()]{6,}$/.test(value)) {
        const msg = check.messages?.phone || t("validation.invalid");
        showFieldError(resolvedField, msg);
        valid = false;
        break;
      }
      if (check.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        const msg = check.messages?.email || t("auth.invalidEmail");
        showFieldError(resolvedField, msg);
        valid = false;
        break;
      }
      if (check.custom && !check.custom(value, form)) {
        const msg =
          check.message || check.messages?.custom || t("validation.invalid");
        showFieldError(resolvedField, msg);
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
