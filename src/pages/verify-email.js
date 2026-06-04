import { t } from '../core/i18n/index.js';
import { api } from '../core/api/client.js';
import { navigate, registerRouteCleanup } from '../core/router/index.js';
import { escapeHtml } from '../core/utils/dom.js';

export default function renderVerifyEmail(container) {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const token = params.get("token");

  if (!token) {
    container.innerHTML = `<div class="auth-page"><div class="card"><div class="card-body"><div class="empty-state"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i><h3>${t("verify.invalidLink")}</h3><a href="#/login" class="btn btn-primary mt-3">${t("auth.login")}</a></div></div></div></div>`;
    return;
  }

  container.innerHTML = `<div class="auth-page"><div class="card"><div class="card-body"><div class="loading"><i class="fas fa-spinner spinner" aria-hidden="true"></i><p>${t("common.loading")}</p></div></div></div></div>`;

  api
    .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    .then(async () => {
      container.innerHTML = `
        <div class="auth-page"><div class="card">
          <div class="card-body">
          <div class="empty-state">
            <i class="fas fa-check-circle" style="color:var(--success)" aria-hidden="true"></i>
            <h3>${t("verify.success")}</h3>
            <p>${t("verify.redirecting")}</p>
          </div>
          </div>
        </div></div>`;

      // Cleanup pending login info
      sessionStorage.removeItem("pendingLoginEmail");

      // Redirect to login (auto-login with password removed for security)
      const timer = setTimeout(() => navigate("login"), 2000);
      registerRouteCleanup(() => clearTimeout(timer));
    })
    .catch((err) => {
      container.innerHTML = `
        <div class="auth-page"><div class="card">
          <div class="card-body">
          <div class="empty-state"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i><h3>${t("verify.error")}</h3>
          <p style="font-size:var(--text-sm);opacity:0.7;margin-top:4px">${escapeHtml(err.message || "")}</p>
          <a href="#/login" class="btn btn-primary mt-3">${t("auth.login")}</a>
        </div></div></div></div>`;
    });
}
