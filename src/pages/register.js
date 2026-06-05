import { t } from "../core/i18n/index.js";
import { api } from "../core/api/client.js";
import { isAuthenticated, updateNavbar, syncVipAttribute } from "../core/auth/index.js";
import { navigate, registerRouteCleanup } from "../core/router/index.js";
import { escapeHtml, showLoading } from "../core/utils/dom.js";
import { ensureCsrfToken } from "../core/utils/csrf.js";
import { ROLES } from "../shared/constants/roles.js";
import { setPageMeta } from "../core/utils/seo.js";
import {
  getPasswordStrengthResult,
  calculateAge,
  clearAllFieldErrors,
  validateForm,
} from "../core/utils/validation.js";
import { showToast } from "../core/utils/ui.js";
import Alpine from "alpinejs";

Alpine.data("registerForm", () => ({
  fullName: "",
  email: "",
  phone: "",
  birthdate: "",
  password: "",
  confirmPassword: "",
  role: "Customer",
  terms: false,
  showPassword: false,
  loading: false,
  ageDisplay: "",
  ageColor: "",
  strengthCls: "strength-empty",
  strengthLabel: "",
  licenseNumber: "",

  get needsLicense() {
    return this.role === ROLES.FISHERMAN;
  },

  computeAge() {
    const age = calculateAge(this.birthdate);
    if (!isNaN(age) && this.birthdate) {
      this.ageDisplay = t("auth.ageLabel", { age });
      this.ageColor = age >= 18 ? "var(--success)" : "var(--danger)";
    } else {
      this.ageDisplay = "";
    }
  },

  computeStrength() {
    if (!this.password) {
      this.strengthCls = "strength-empty";
      this.strengthLabel = "";
      return;
    }
    const result = getPasswordStrengthResult(this.password);
    this.strengthCls = result.cls;
    this.strengthLabel = t(result.label);
  },

  togglePw() {
    this.showPassword = !this.showPassword;
  },

  async submit() {
    this.loading = true;
    clearAllFieldErrors(document.getElementById("registerForm"));
    document.getElementById("registerAlert").innerHTML = "";

    const fields = [
      {
        element: document.getElementById("regName"),
        required: true,
        messages: { required: t("auth.fieldRequired") },
      },
      {
        element: document.getElementById("regEmail"),
        required: true,
        email: true,
        messages: { required: t("auth.invalidEmail") },
      },
      {
        element: document.getElementById("regPhone"),
        required: true,
        phone: true,
        messages: { required: t("auth.fieldRequired") },
      },
      {
        element: document.getElementById("regBirthdate"),
        required: true,
        minAge: 18,
        messages: { required: t("auth.fieldRequired") },
      },
      {
        element: document.getElementById("regPassword"),
        required: true,
        minLength: 8,
        messages: { minLength: t("auth.passwordMinLength") },
      },
      {
        element: document.getElementById("regConfirmPw"),
        required: true,
        matches: { element: document.getElementById("regPassword") },
        messages: { matches: t("auth.passwordsDoNotMatch") },
      },
    ];
    if (this.needsLicense) {
      fields.push({
        element: document.getElementById("regLicense"),
        required: true,
        messages: { required: t("auth.licenseRequired") },
      });
    }

    let valid = validateForm(document.getElementById("registerForm"), fields);
    if (!this.terms) {
      showToast(t("auth.termsRequired"), "error");
      valid = false;
    }
    if (!valid) {
      this.loading = false;
      return;
    }

    try {
      const payload = {
        fullName: this.fullName.trim(),
        email: this.email.trim(),
        phone: this.phone.trim(),
        password: this.password,
        role: this.role,
      };
      if (this.needsLicense) payload.licenseNumber = this.licenseNumber.trim();

      await api.post("/auth/register", payload);
      sessionStorage.removeItem("sayiadRegFails");
      sessionStorage.setItem("pendingLoginEmail", this.email.trim());
      document.getElementById("registerForm").reset();
      showVerificationOverlay(this.email.trim(), this.password);
      this.fullName = "";
      this.email = "";
      this.phone = "";
      this.birthdate = "";
      this.password = "";
      this.confirmPassword = "";
      this.role = "Customer";
      this.terms = false;
      this.strengthCls = "strength-empty";
      this.strengthLabel = "";
      this.licenseNumber = "";
    } catch (err) {
      document.getElementById("registerAlert").innerHTML =
        `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
      let regFails = parseInt(sessionStorage.getItem('sayiadRegFails') || '0') + 1;
      sessionStorage.setItem('sayiadRegFails', regFails);
      if (regFails >= 3) {
        const submitBtn = document.getElementById('registerSubmitBtn')
          || document.querySelector('#registerForm button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        let secs = 60;
        const lockMsg = document.getElementById('registerLockMsg');
        if (lockMsg) lockMsg.classList.remove('hidden');
        const timer = setInterval(() => {
          secs--;
          if (lockMsg) lockMsg.textContent = t('auth.tooManyAttempts', { secs });
          if (secs <= 0) {
            clearInterval(timer);
            this._lockoutTimer = null;
            sessionStorage.removeItem('sayiadRegFails');
            if (submitBtn) submitBtn.disabled = false;
            if (lockMsg) lockMsg.classList.add('hidden');
          }
        }, 1000);
        this._lockoutTimer = timer;
      }
    } finally {
      this.loading = false;
    }
  },

  destroy() {
    if (this._lockoutTimer) {
      clearInterval(this._lockoutTimer);
      this._lockoutTimer = null;
    }
  },
}));

export default function renderRegister(container) {
  setPageMeta(t('register.title'));
  if (isAuthenticated()) {
    navigate("");
    return;
  }

  container.innerHTML = `
    <div x-data="registerForm" class="auth-page animate__animated animate__fadeIn">
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-user-plus" aria-hidden="true"></i> ${t("auth.register")}</h2>
        </div>
        <div class="card-body">
        <div id="registerAlert"></div>
        <form id="registerForm" @submit.prevent="submit()" novalidate>
          <div class="form-group">
            <label class="form-label" for="regName">${t("auth.fullName")}</label>
            <input type="text" class="form-input form-control" id="regName" name="fullName" x-model="fullName" placeholder="${t('auth.fullNamePlaceholder')}" required autocomplete="name">
          </div>
          <div class="form-group">
            <label class="form-label" for="regEmail">${t("auth.email")}</label>
            <input type="email" class="form-input form-control" id="regEmail" name="email" x-model="email" placeholder="${t('auth.emailPlaceholder')}" required autocomplete="email" inputmode="email">
          </div>
          <div class="form-group">
            <label class="form-label" for="regPhone">${t("auth.phone")}</label>
            <input type="tel" class="form-input form-control" id="regPhone" name="phone" x-model="phone" placeholder="${t('auth.phonePlaceholder')}" autocomplete="tel" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="regBirthdate">${t("auth.birthdate")}</label>
            <input type="date" class="form-input form-control" id="regBirthdate" name="birthdate" x-model="birthdate" @input="computeAge()"
              max="${new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}" required>
            <div class="password-strength-text" x-text="ageDisplay" :style="ageColor ? 'color:' + ageColor : ''"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="regPassword">${t("auth.password")}</label>
            <div class="password-wrapper">
              <input :type="showPassword ? 'text' : 'password'" class="form-input form-control" id="regPassword" name="password" x-model="password" @input="computeStrength()" placeholder="${t("auth.password")}" required autocomplete="new-password" minlength="8">
              <button type="button" class="toggle-password" @click="togglePw()" :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"><i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i></button>
            </div>
            <div class="pw-strength" id="pwStrengthBar" aria-live="polite">
              <div class="pw-strength__track"><div class="pw-strength__fill" id="pwFill"></div></div>
              <span class="pw-strength__label" id="pwLabel"></span>
            </div>
            <ul class="pw-reqs" id="pwReqs" aria-label="${t('auth.passwordRequirements')}">
              <li id="req-len"><i class="fas fa-circle" aria-hidden="true"></i> ${t('auth.reqLength')}</li>
              <li id="req-upper"><i class="fas fa-circle" aria-hidden="true"></i> ${t('auth.reqUpper')}</li>
              <li id="req-lower"><i class="fas fa-circle" aria-hidden="true"></i> ${t('auth.reqLower')}</li>
              <li id="req-num"><i class="fas fa-circle" aria-hidden="true"></i> ${t('auth.reqNum')}</li>
              <li id="req-special"><i class="fas fa-circle" aria-hidden="true"></i> ${t('auth.reqSpecial')}</li>
            </ul>
          </div>
          <div class="form-group">
            <label class="form-label" for="regConfirmPw">${t("auth.confirmPassword")}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input form-control" id="regConfirmPw" name="confirmPassword" x-model="confirmPassword" placeholder="${t("auth.confirmPassword")}" required autocomplete="new-password" minlength="6">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="regRole">${t("auth.role")}</label>
            <select class="form-select" id="regRole" name="role" x-model="role">
              <option value="Customer">${t("auth.customer")}</option>
              <option value="Fisherman">${t("auth.fisherman")}</option>
              <option value="BaitSeller">${t("auth.baitSeller")}</option>
              <option value="Auctioneer">${t("auth.auctioneer")}</option>
            </select>
          </div>
          <div x-show="needsLicense" x-cloak>
            <div class="form-group animate-on-scroll slide-down" style="display: block; opacity: 1; transform: translateY(0);">
              <label class="form-label" for="regLicense">${t("auth.licenseNumber")} *</label>
              <input type="text" class="form-input form-control" id="regLicense" name="licenseNumber" x-model="licenseNumber" placeholder="${t('auth.licensePlaceholder')}" required>
            </div>
          </div>
          <div class="form-group">
            <div class="d-flex mb-2" style="gap:10px; align-items:flex-start">
              <input type="checkbox" id="regTerms" name="terms" x-model="terms" style="width:18px; height:18px; cursor:pointer; margin-top:2px">
              <label for="regTerms" style="font-size:var(--text-sm); color:var(--text-secondary); cursor:pointer; line-height:1.4">
                ${t("auth.iAccept")} <a href="#/terms" class="legal-link text-primary fw-semibold text-decoration-none">${t("auth.termsAndConditions")}</a> 
                ${t("auth.and")} <a href="#/privacy" class="legal-link text-primary fw-semibold text-decoration-none">${t("auth.privacyPolicy")}</a>
              </label>
            </div>
          </div>
          <div id="registerLockMsg" class="field-error hidden" role="alert" aria-live="assertive" style="margin-bottom:8px"></div>
          <button type="submit" id="registerSubmitBtn" class="btn btn-primary w-100 btn-lg" :disabled="loading">
            <i class="fas fa-spinner spinner" x-show="loading" x-cloak></i>
            <span x-text="loading ? $t('auth.creatingAccount') : $t('auth.createAccount')"></span>
          </button>
        </form>
        </div>
        <div class="card-footer">
          <div class="auth-footer">${t("auth.hasAccount")} <a href="#/login">${t("auth.login")}</a></div>
        </div>
      </div>
    </div>`;

  // Password strength live checker
  const _pwInput = document.getElementById('regPassword');
  if (_pwInput) _pwInput.addEventListener('input', () => _checkPwStrength(_pwInput.value));

  function _checkPwStrength(pw) {
    const checks = {
      len:     pw.length >= 8,
      upper:   /[A-Z]/.test(pw),
      lower:   /[a-z]/.test(pw),
      num:     /[0-9]/.test(pw),
      special: /[@$!%*?&#^()_+\-={}|;<>?]/.test(pw)
    };
    const score  = Object.values(checks).filter(Boolean).length;
    const colors = ['','var(--danger)','var(--warning)','var(--warning)','var(--success)','var(--success)'];
    const labels = ['', t('auth.veryWeak'), t('auth.weak'), t('auth.fair'), t('auth.strong'), t('auth.veryStrong')];

    Object.entries(checks).forEach(([k,v]) => {
      const li = document.getElementById('req-' + k);
      if (!li) return;
      li.style.color = v ? 'var(--success)' : '';
      li.querySelector('i').className = v ? 'fas fa-check-circle' : 'fas fa-circle';
    });

    const fill  = document.getElementById('pwFill');
    const label = document.getElementById('pwLabel');
    if (fill)  { fill.style.width = (score*20)+'%'; fill.style.background = colors[score]; }
    if (label) { label.textContent = labels[score]; label.style.color = colors[score]; }
  }

  // Legal link loading UX (vanilla, unchanged)
  document.querySelectorAll(".legal-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("href").replace("#/", "");
      const app = document.getElementById("app");
      showLoading(app, "page");
      setTimeout(() => navigate(target), 300);
    });
  });
}

function showVerificationOverlay(email, password) {
  const overlay = document.createElement("div");
  overlay.className = "verify-overlay";
  overlay.innerHTML = `
    <div class="verify-overlay-card" id="verifyCard">
      <div class="verify-overlay-icon" id="verifyIcon">
        <i class="fas fa-envelope" id="verifyIconInner" aria-hidden="true"></i>
      </div>
      <h3 id="verifyTitle">${t("verify.waitingTitle")}</h3>
      <p id="verifyDesc">${t("verify.waitingDesc")} <strong>${escapeHtml(email)}</strong></p>
      <div class="verify-overlay-dots" id="verifyDots">
        <span></span><span></span><span></span>
      </div>
      <div id="verifyError" class="d-none alert alert-error"></div>
      <div class="verify-actions mt-4 d-flex flex-column gap-2">
        <button class="btn btn-primary" id="verifyCheckBtn"><i class="fas fa-check-circle" aria-hidden="true"></i> ${t("verify.alreadyVerified")}</button>
        <button class="btn btn-ghost" id="verifyChangeEmailBtn"><i class="fas fa-arrow-left" aria-hidden="true"></i> ${t("verify.useOtherEmail")}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add("show");
  });

  let polling = true;
  let pollCount = 0;
  const maxPolls = 120;

  const doLogin = async () => {
    const data = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    ensureCsrfToken();
    updateNavbar();
    await syncVipAttribute();
    return data;
  };

  const showSuccess = () => {
    polling = false;
    const icon = document.getElementById("verifyIconInner");
    icon.className = "fas fa-check-circle";
    icon.style.color = "var(--success)";
    document.getElementById("verifyTitle").textContent = t(
      "verify.successTitle",
    );
    document.getElementById("verifyDesc").textContent = t("verify.successDesc");
    document.getElementById("verifyDots").style.display = "none";
    document.getElementById("verifyCheckBtn").remove();
    document.getElementById("verifyChangeEmailBtn").remove();
    overlay.querySelector(".verify-overlay-card").classList.add("verified");
    setTimeout(() => {
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 350);
      navigate("");
    }, 1800);
  };

  const cleanup = () => {
    polling = false;
    clearInterval(interval);
    overlay.classList.remove("show");
    setTimeout(() => overlay.remove(), 350);
  };
  registerRouteCleanup(cleanup);

  const interval = setInterval(async () => {
    if (!polling) {
      clearInterval(interval);
      return;
    }
    pollCount++;
    if (pollCount > maxPolls) {
      clearInterval(interval);
      document.getElementById("verifyError").style.display = "block";
      document.getElementById("verifyError").textContent =
        t("auth.verificationTimeout");
      return;
    }
    try {
      await doLogin();
      clearInterval(interval);
      showSuccess();
    } catch {
      // Not verified yet
    }
  }, 3000);

  document
    .getElementById("verifyCheckBtn")
    .addEventListener("click", async () => {
      if (!polling) return;
      document.getElementById("verifyCheckBtn").disabled = true;
      document.getElementById("verifyCheckBtn").innerHTML =
        `<i class="fas fa-spinner spinner" aria-hidden="true"></i>`;
      try {
        await doLogin();
        clearInterval(interval);
        showSuccess();
      } catch (err) {
        document.getElementById("verifyCheckBtn").disabled = false;
        document.getElementById("verifyCheckBtn").innerHTML =
          `<i class="fas fa-check-circle" aria-hidden="true"></i> ${t("verify.alreadyVerified")}`;
        document.getElementById("verifyError").style.display = "block";
        document.getElementById("verifyError").textContent = err.message;
      }
    });

  document
    .getElementById("verifyChangeEmailBtn")
    .addEventListener("click", () => {
      polling = false;
      clearInterval(interval);
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 350);
    });
}
