import { t } from '../../shared/utils/i18n.js';

const skeletons = {
  page: `<div class="skeleton-page"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text short"></div></div>`,
  card: `<div class="skeleton-card"><div class="skeleton skeleton-img"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>`,
  detail: `<div class="skeleton-detail"><div class="skeleton skeleton-img-lg"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div><div class="skeleton skeleton-text"></div></div>`,
  table: `<div class="skeleton-table"><div class="skeleton skeleton-row"></div><div class="skeleton skeleton-row"></div><div class="skeleton skeleton-row"></div></div>`,
  auth: `<div class="skeleton-auth"><div class="skeleton skeleton-avatar"></div><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>`,
  form: `<div class="skeleton-form"><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-input"></div><div class="skeleton skeleton-btn"></div></div>`,
};

export function showLoading(container, type = 'page') {
  const template = skeletons[type] || skeletons.page;
  container.innerHTML = `<div class="global-skeleton" role="status" aria-label="Loading">${template}</div>`;
}

export function showError(container, msg) {
  container.innerHTML = `<div class="global-error" role="alert"><i class="fas fa-exclamation-circle"></i><p>${msg}</p></div>`;
}

export function showErrorFallback(container, message) {
  const errDiv = document.createElement("div");
  errDiv.className = "global-error";
  errDiv.setAttribute("role", "alert");

  const errIcon = document.createElement("i");
  errIcon.className = "fas fa-exclamation-triangle";
  errIcon.style.cssText = "font-size:2rem;color:var(--danger)";
  errDiv.appendChild(errIcon);

  const errMsg = document.createElement("p");
  errMsg.style.cssText = "margin:12px 0;color:var(--text-primary)";
  errMsg.textContent = message || t("common.errorOccurred");
  errDiv.appendChild(errMsg);

  const btnGroup = document.createElement("div");
  btnGroup.className = "d-flex gap-2 justify-content-center";
  btnGroup.style.marginTop = "8px";

  const homeBtn = document.createElement("button");
  homeBtn.className = "btn btn-primary";
  const homeIcon = document.createElement("i");
  homeIcon.className = "fas fa-home";
  homeBtn.appendChild(homeIcon);
  homeBtn.appendChild(document.createTextNode(` ${t("common.goHome")}`));
  homeBtn.addEventListener("click", () => { window.location.hash = "#/"; });
  btnGroup.appendChild(homeBtn);

  const retryBtn = document.createElement("button");
  retryBtn.className = "btn btn-outline";
  const retryIcon = document.createElement("i");
  retryIcon.className = "fas fa-redo";
  retryBtn.appendChild(retryIcon);
  retryBtn.appendChild(document.createTextNode(` ${t("common.tryAgain")}`));
  retryBtn.addEventListener("click", () => { window.location.reload(); });
  btnGroup.appendChild(retryBtn);

  errDiv.appendChild(btnGroup);
  container.textContent = "";
  container.appendChild(errDiv);
}
