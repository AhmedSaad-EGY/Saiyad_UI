function renderLogin(container) {
  if (isAuthenticated()) { navigate(''); return; }
  container.innerHTML = `
    <div class="auth-page">
      <div class="card">
        <h2><i class="fas fa-sign-in-alt"></i> ${t('auth.login')}</h2>
        <div id="loginAlert"></div>
        <form id="loginForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="loginEmail">${t('auth.email')}</label>
            <input type="email" class="form-input" id="loginEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">${t('auth.password')}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="loginPassword" name="password" placeholder="${t('auth.password')}" required autocomplete="current-password" minlength="6">
              <button type="button" class="toggle-password" id="loginTogglePw" aria-label="${t('auth.showPassword')}" tabindex="-1"><i class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="loginSubmit">${t('auth.signIn')}</button>
        </form>
        <div class="auth-footer">${t('auth.noAccount')} <a href="#/register">${t('auth.register')}</a></div>
      </div>
    </div>
  `;

  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginTogglePw = document.getElementById('loginTogglePw');

  function clearLoginErrors() {
    clearAllFieldErrors(loginForm);
    document.getElementById('loginAlert').innerHTML = '';
  }

  loginEmail.addEventListener('input', () => clearFieldError(loginEmail));
  loginEmail.addEventListener('blur', () => {
    if (loginEmail.value.trim() && !loginEmail.validity.valid) {
      showFieldError(loginEmail, t('auth.invalidEmail'));
    }
  });
  loginPassword.addEventListener('input', () => clearFieldError(loginPassword));

  loginTogglePw.addEventListener('click', () => {
    const isPw = loginPassword.type === 'password';
    loginPassword.type = isPw ? 'text' : 'password';
    loginTogglePw.innerHTML = isPw ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    loginTogglePw.setAttribute('aria-label', isPw ? t('auth.hidePassword') : t('auth.showPassword'));
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearLoginErrors();
    const submit = document.getElementById('loginSubmit');
    const alertDiv = document.getElementById('loginAlert');
    let valid = true;

    if (!loginEmail.value.trim() || !loginEmail.validity.valid) {
      showFieldError(loginEmail, loginEmail.validationMessage || t('auth.invalidEmail'));
      valid = false;
    }
    if (!loginPassword.value || loginPassword.value.length < 6) {
      showFieldError(loginPassword, t('auth.password') + ' must be at least 6 characters.');
      valid = false;
    }

    if (!valid) {
      const firstErr = loginForm.querySelector('.error');
      if (firstErr) { firstErr.classList.add('shake'); setTimeout(() => firstErr.classList.remove('shake'), 500); firstErr.focus(); }
      return;
    }

    submit.disabled = true;
    submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t('auth.signingIn')}`;

    try {
      const data = await api.post('/auth/login', { email: loginEmail.value.trim(), password: loginPassword.value });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user || data));
      updateNavbar();
      navigate('');
    } catch (err) {
      alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    } finally {
      submit.disabled = false;
      submit.textContent = t('auth.signIn');
    }
  });
}
