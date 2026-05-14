function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score < 2) return { cls: 'strength-weak', label: t('auth.passwordStrength.weak') };
  if (score < 3) return { cls: 'strength-fair', label: t('auth.passwordStrength.fair') };
  if (score < 4) return { cls: 'strength-good', label: t('auth.passwordStrength.good') };
  return { cls: 'strength-strong', label: t('auth.passwordStrength.strong') };
}

function renderRegister(container) {
  if (isAuthenticated()) { navigate(''); return; }
  container.innerHTML = `
    <div class="auth-page">
      <div class="card">
        <h2><i class="fas fa-user-plus"></i> ${t('auth.register')}</h2>
        <div id="registerAlert"></div>
        <form id="registerForm" novalidate>
          <div class="form-group">
            <label class="form-label" for="regName">${t('auth.fullName')}</label>
            <input type="text" class="form-input" id="regName" name="fullName" placeholder="John Doe" required autocomplete="name">
          </div>
          <div class="form-group">
            <label class="form-label" for="regEmail">${t('auth.email')}</label>
            <input type="email" class="form-input" id="regEmail" name="email" placeholder="your@email.com" required autocomplete="email" inputmode="email">
          </div>
          <div class="form-group">
            <label class="form-label" for="regPhone">${t('auth.phone')}</label>
            <input type="tel" class="form-input" id="regPhone" name="phone" placeholder="+1234567890" autocomplete="tel">
          </div>
          <div class="form-group">
            <label class="form-label" for="regPassword">${t('auth.password')}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="regPassword" name="password" placeholder="${t('auth.password')}" required autocomplete="new-password" minlength="6">
              <button type="button" class="toggle-password" id="regTogglePw" aria-label="${t('auth.showPassword')}" tabindex="-1"><i class="fas fa-eye"></i></button>
            </div>
            <div class="password-strength" id="regStrength"><div class="password-strength-bar" id="regStrengthBar"></div></div>
            <div class="password-strength-text" id="regStrengthText"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="regConfirmPw">${t('auth.confirmPassword')}</label>
            <div class="password-wrapper">
              <input type="password" class="form-input" id="regConfirmPw" name="confirmPassword" placeholder="${t('auth.confirmPassword')}" required autocomplete="new-password" minlength="6">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="regRole">${t('auth.role')}</label>
            <select class="form-select" id="regRole" name="role">
              <option value="Customer">${t('auth.customer')}</option>
              <option value="Fisherman">${t('auth.fisherman')}</option>
              <option value="BaitSeller">${t('auth.baitSeller')}</option>
              <option value="Auctioneer">${t('auth.auctioneer')}</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="registerSubmit">${t('auth.createAccount')}</button>
        </form>
        <div class="auth-footer">${t('auth.hasAccount')} <a href="#/login">${t('auth.login')}</a></div>
      </div>
    </div>
  `;

  const regForm = document.getElementById('registerForm');
  const regName = document.getElementById('regName');
  const regEmail = document.getElementById('regEmail');
  const regPhone = document.getElementById('regPhone');
  const regPassword = document.getElementById('regPassword');
  const regConfirmPw = document.getElementById('regConfirmPw');
  const regTogglePw = document.getElementById('regTogglePw');
  const strengthBar = document.getElementById('regStrengthBar');
  const strengthText = document.getElementById('regStrengthText');

  function clearRegErrors() {
    clearAllFieldErrors(regForm);
    document.getElementById('registerAlert').innerHTML = '';
  }

  regName.addEventListener('input', () => clearFieldError(regName));
  regEmail.addEventListener('input', () => clearFieldError(regEmail));
  regEmail.addEventListener('blur', () => {
    if (regEmail.value.trim() && !regEmail.validity.valid) {
      showFieldError(regEmail, t('auth.invalidEmail'));
    }
  });
  regPhone.addEventListener('input', () => clearFieldError(regPhone));

  regTogglePw.addEventListener('click', () => {
    const isPw = regPassword.type === 'password';
    regPassword.type = isPw ? 'text' : 'password';
    regTogglePw.innerHTML = isPw ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    regTogglePw.setAttribute('aria-label', isPw ? t('auth.hidePassword') : t('auth.showPassword'));
  });

  regPassword.addEventListener('input', () => {
    clearFieldError(regPassword);
    const pw = regPassword.value;
    if (!pw) {
      strengthBar.className = 'password-strength-bar strength-empty';
      strengthText.textContent = '';
      return;
    }
    const result = getPasswordStrength(pw);
    strengthBar.className = 'password-strength-bar ' + result.cls;
    strengthText.textContent = result.label;
    strengthText.style.color = getComputedStyle(strengthBar).backgroundColor;
    if (regConfirmPw.value) {
      if (pw !== regConfirmPw.value) {
        showFieldError(regConfirmPw, t('auth.passwordsDoNotMatch'));
      } else {
        clearFieldError(regConfirmPw);
      }
    }
  });

  regConfirmPw.addEventListener('input', () => {
    clearFieldError(regConfirmPw);
    if (regConfirmPw.value && regConfirmPw.value !== regPassword.value) {
      showFieldError(regConfirmPw, t('auth.passwordsDoNotMatch'));
    }
  });

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearRegErrors();
    const submit = document.getElementById('registerSubmit');
    const alertDiv = document.getElementById('registerAlert');
    let valid = true;

    if (!regName.value.trim()) {
      showFieldError(regName, t('auth.fullName') + ' is required.');
      valid = false;
    }
    if (!regEmail.value.trim() || !regEmail.validity.valid) {
      showFieldError(regEmail, regEmail.validationMessage || t('auth.invalidEmail'));
      valid = false;
    }
    if (!regPassword.value || regPassword.value.length < 6) {
      showFieldError(regPassword, t('auth.password') + ' must be at least 6 characters.');
      valid = false;
    }
    if (regPassword.value !== regConfirmPw.value) {
      showFieldError(regConfirmPw, t('auth.passwordsDoNotMatch'));
      valid = false;
    }

    if (!valid) {
      const firstErr = regForm.querySelector('.error');
      if (firstErr) { firstErr.classList.add('shake'); setTimeout(() => firstErr.classList.remove('shake'), 500); firstErr.focus(); }
      return;
    }

    submit.disabled = true;
    submit.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t('auth.creatingAccount')}`;

    try {
      await api.post('/auth/register', {
        fullName: regName.value.trim(),
        email: regEmail.value.trim(),
        phone: regPhone.value.trim(),
        password: regPassword.value,
        role: document.getElementById('regRole').value,
      });
      alertDiv.innerHTML = `<div class="alert alert-success">${t('auth.registerSuccess')}</div>`;
      regForm.reset();
      strengthBar.className = 'password-strength-bar strength-empty';
      strengthText.textContent = '';
      setTimeout(() => navigate('login'), 1500);
    } catch (err) {
      alertDiv.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    } finally {
      submit.disabled = false;
      submit.textContent = t('auth.createAccount');
    }
  });
}
