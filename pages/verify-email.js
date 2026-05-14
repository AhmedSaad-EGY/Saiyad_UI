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

      // Attempt auto-login with stored credentials
      const email = sessionStorage.getItem("pendingLoginEmail");
      const password = sessionStorage.getItem("pendingLoginPassword");
      sessionStorage.removeItem("pendingLoginEmail");
      sessionStorage.removeItem("pendingLoginPassword");

      if (email && password) {
        try {
          const data = await api.post("/auth/login", { email, password });
          localStorage.setItem("accessToken", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          localStorage.setItem("user", JSON.stringify(data.user));
          updateNavbar();
          showToast(t("auth.loginSuccess"), "success");
          setTimeout(() => navigate(""), 1000);
          return;
        } catch {
          // Auto-login failed — fall through to manual login redirect
        }
      }

      // No credentials available or auto-login failed — go to login page
      setTimeout(() => navigate("login"), 2000);
    })
    .catch(() => {
      container.innerHTML = `
        <div class="auth-page"><div class="card">
          <div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>${t("verify.error")}</h3><a href="#/login" class="btn btn-primary" style="margin-top:16px">${t("auth.login")}</a></div>
        </div></div>`;
    });
}
