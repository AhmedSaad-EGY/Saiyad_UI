function renderVerifyEmail(container) {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const token = params.get("token");

  if (!token) {
    container.innerHTML = `<div class="auth-page"><div class="card"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>${t("verify.invalidLink")}</h3><a href="#/login" class="btn btn-primary" style="margin-top:16px">${t("auth.login")}</a></div></div></div>`;
    return;
  }

  container.innerHTML = `<div class="auth-page"><div class="card"><div class="loading"><i class="fas fa-spinner spinner"></i><p>${t("common.loading")}</p></div></div></div>`;

  api
    .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    .then(async () => {
      container.innerHTML = `
        <div class="auth-page"><div class="card">
          <div class="empty-state">
            <i class="fas fa-check-circle" style="color:var(--success)"></i>
            <h3>${t("verify.success")}</h3>
            <p>${t("verify.loggingIn")}</p>
          </div>
        </div></div>`;

      // Cleanup pending login info
      sessionStorage.removeItem("pendingLoginEmail");

      // Redirect to login (auto-login with password removed for security)
      setTimeout(() => navigate("login"), 2000);
    })
    .catch(() => {
      container.innerHTML = `
        <div class="auth-page"><div class="card">
          <div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>${t("verify.error")}</h3><a href="#/login" class="btn btn-primary" style="margin-top:16px">${t("auth.login")}</a></div>
        </div></div>`;
    });
}
