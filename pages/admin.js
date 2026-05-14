async function renderAdmin(container) {
  const user = getUser();
  if (!user || !hasRole('Admin')) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-shield-alt"></i><h3>${t('admin.noAccess')}</h3></div>`;
    return;
  }

  const tabs = [
    { id: 'users', icon: 'fa-users', label: t('admin.users') },
    { id: 'reports', icon: 'fa-flag', label: t('admin.reports') },
    { id: 'orders', icon: 'fa-box', label: t('admin.orders') },
    { id: 'categories', icon: 'fa-tags', label: t('admin.categories') },
  ];

  let activeTab = 'users';

  container.innerHTML = `
    <div class="section-header"><h2><i class="fas fa-shield-alt"></i> ${t('admin.title')}</h2></div>
    <div class="tabs" id="adminTabs">${tabs.map(t => `<button class="tab ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}"><i class="fas ${t.icon}"></i> ${t.label}</button>`).join('')}</div>
    <div id="adminContent"></div>`;

  const content = document.getElementById('adminContent');

  document.getElementById('adminTabs').addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab');
    if (!tabBtn) return;
    activeTab = tabBtn.dataset.tab;
    document.querySelectorAll('#adminTabs .tab').forEach(t => t.classList.remove('active'));
    tabBtn.classList.add('active');
    loadTab();
  });

  function loadTab() {
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'reports') loadReports();
    else if (activeTab === 'orders') loadAdminOrders();
    else if (activeTab === 'categories') loadCategories();
  }

  async function loadUsers() {
    showLoading(content);
    try {
      const data = await api.get('/users');
      const users = data.items || data.data || data || [];
      content.innerHTML = `
        <div class="table-wrapper"><table>
          <thead><tr><th>${t('admin.id')}</th><th>${t('admin.name')}</th><th>${t('admin.email')}</th><th>${t('admin.role')}</th><th>${t('admin.status')}</th><th></th></tr></thead>
          <tbody>${users.map(u => `
            <tr>
              <td>${u.id}</td>
              <td>${escapeHtml(u.fullName)}</td>
              <td>${escapeHtml(u.email)}</td>
              <td>${u.role}</td>
              <td><span class="status ${u.isActive ? 'status-available' : 'status-sold'}">${u.isActive ? t('admin.active') : t('admin.inactive')}</span></td>
              <td><button class="btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'} toggle-user" data-id="${u.id}">${t('admin.toggleStatus')}</button></td>
            </tr>`).join('')}
          </tbody>
        </table></div>`;
      content.querySelectorAll('.toggle-user').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await api.patch(`/users/${btn.dataset.id}/toggle-status`);
            showToast(t('admin.userToggled'), 'success');
            loadUsers();
          } catch (err) { showToast(err.message, 'error'); }
        });
      });
    } catch (err) { showError(content, err.message); }
  }

  async function loadReports() {
    showLoading(content);
    try {
      const data = await api.get('/reports');
      const reports = data.items || data.data || data || [];
      content.innerHTML = `
        <div class="table-wrapper"><table>
          <thead><tr><th>${t('admin.id')}</th><th>${t('cart.product')}</th><th>${t('admin.reportReason')}</th><th>${t('admin.reportStatus')}</th><th></th></tr></thead>
          <tbody>${reports.map(r => `
            <tr>
              <td>${r.id}</td>
              <td>#${r.productId}</td>
              <td>${escapeHtml(r.reason || '-')}</td>
              <td><span class="status ${r.status === 'Resolved' ? 'status-available' : 'status-draft'}">${r.status || 'Open'}</span></td>
              <td>${r.status !== 'Resolved' ? `<button class="btn btn-sm btn-success resolve-report" data-id="${r.id}">${t('admin.resolve')}</button>` : '-'}</td>
            </tr>`).join('')}
          </tbody>
        </table></div>`;
      content.querySelectorAll('.resolve-report').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await api.put(`/reports/${btn.dataset.id}/resolve`, { status: 'Resolved' });
            showToast('Report resolved', 'success');
            loadReports();
          } catch (err) { showToast(err.message, 'error'); }
        });
      });
    } catch (err) { showError(content, err.message); }
  }

  async function loadAdminOrders() {
    showLoading(content);
    try {
      const data = await api.get('/orders');
      const orders = data.items || data.data || data || [];
      content.innerHTML = `
        <div class="table-wrapper"><table>
          <thead><tr><th>${t('dash.orderNum')}</th><th>${t('order.buyer')}</th><th>${t('order.total')}</th><th>${t('order.status')}</th><th>${t('dash.date')}</th><th></th></tr></thead>
          <tbody>${orders.map(o => `
            <tr>
              <td>#${o.id}</td>
              <td>${escapeHtml(o.buyerName || '-')}</td>
              <td>${formatPrice(o.totalPrice)}</td>
              <td><span class="status ${statusClass(o.status)}">${o.status}</span></td>
              <td>${formatDate(o.createdAt)}</td>
              <td><a href="#/order-detail?id=${o.id}" class="btn btn-sm btn-ghost">${t('dash.view')}</a></td>
            </tr>`).join('')}
          </tbody>
        </table></div>`;
    } catch (err) { showError(content, err.message); }
  }

  async function loadCategories() {
    showLoading(content);
    try {
      const data = await api.get('/categories');
      const cats = data.items || data.data || data || [];
      content.innerHTML = `
        <div style="margin-bottom:16px"><button class="btn btn-primary btn-sm" id="showAddCat"><i class="fas fa-plus"></i> ${t('admin.addCategory')}</button></div>
        <div id="addCatForm" class="hidden card card-sm" style="max-width:400px;margin-bottom:16px">
          <form id="catForm" novalidate>
            <div class="form-group"><label class="form-label">${t('admin.categoryName')}</label><input type="text" class="form-input" id="catName" required></div>
            <div class="form-group"><label class="form-label">${t('admin.categoryDesc')}</label><input type="text" class="form-input" id="catDesc"></div>
            <button type="submit" class="btn btn-primary btn-sm">${t('admin.addCategory')}</button>
          </form>
        </div>
        <div class="table-wrapper"><table>
          <thead><tr><th>${t('admin.id')}</th><th>${t('admin.name')}</th><th>${t('admin.categoryDesc')}</th><th></th></tr></thead>
          <tbody>${cats.map(c => `
            <tr><td>${c.id}</td><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.description || '-')}</td>
            <td><button class="btn btn-sm btn-danger delete-cat" data-id="${c.id}"><i class="fas fa-trash"></i></button></td></tr>`).join('')}
          </tbody>
        </table></div>`;

      document.getElementById('showAddCat')?.addEventListener('click', () => document.getElementById('addCatForm').classList.toggle('hidden'));
      document.getElementById('catForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await api.post('/categories', { name: document.getElementById('catName').value.trim(), description: document.getElementById('catDesc').value.trim() });
          showToast('Category added', 'success');
          loadCategories();
        } catch (err) { showToast(err.message, 'error'); }
      });
      content.querySelectorAll('.delete-cat').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete category?')) return;
          try { await api.del(`/categories/${btn.dataset.id}`); showToast('Category deleted', 'success'); loadCategories(); }
          catch (err) { showToast(err.message, 'error'); }
        });
      });
    } catch (err) { showError(content, err.message); }
  }

  loadTab();
}
