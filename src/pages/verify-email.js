import { t } from '../shared/utils/i18n.js';
import { setPageMeta } from '../shared/utils/seo.js';
import { escapeHtml } from '../shared/utils/dom.js';
import { navigate } from '../app/router.js';
import { registerRouteCleanup } from '../shared/utils/events.js';
import { verifyEmail } from '../features/auth/verify-email.js';

export default function renderVerifyEmail(container) {
  setPageMeta(t('verify.title'));
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const token = params.get("token");

  if (!token) {
    container.innerHTML = `<div class="auth-page animate__animated animate__fadeIn"><div class="card"><div class="card-body"><div class="empty-state"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i><h3>${t("verify.invalidLink")}</h3><a href="#/login" class="btn btn-primary mt-3">${t("auth.login")}</a></div></div></div></div>`;
    return;
  }

  container.innerHTML = `<div class="auth-page animate__animated animate__fadeIn"><div class="card"><div class="card-body"><div class="loading"><i class="fas fa-spinner spinner" aria-hidden="true"></i><p>${t("common.loading")}</p></div></div></div></div>`;

  const renderError = (msg) => {
    container.innerHTML = `
      <div class="auth-page animate__animated animate__fadeIn"><div class="card">
        <div class="card-body">
        <div class="empty-state"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i><h3>${t("verify.error")}</h3>
        <p style="font-size:var(--text-sm);opacity:0.7;margin-top:4px">${escapeHtml(msg || "")}</p>
        <a href="#/login" class="btn btn-primary mt-3">${t("auth.login")}</a>
      </div></div></div></div>`;
  };

  verifyEmail(token).then((result) => {
    if (result.success) {
      container.innerHTML = `
        <div class="auth-page animate__animated animate__fadeIn"><div class="card">
          <div class="card-body">
          <div class="empty-state">
            <i class="fas fa-check-circle" style="color:var(--success)" aria-hidden="true"></i>
            <h3>${t("verify.success")}</h3>
            <p>${t("verify.redirecting")}</p>
          </div>
          </div>
        </div></div>`;
      const timer = setTimeout(() => navigate("login"), 2000);
      registerRouteCleanup(() => clearTimeout(timer));
    } else {
      renderError(result.message);
    }
  }).catch((err) => {
    renderError(err.message || t("common.error"));
  });
}
