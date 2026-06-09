import { t } from '../shared/utils/i18n.js';
import { requireAuth } from '../features/auth/login.js';
import { registerRouteCleanup } from '../app/router.js';
import renderAuctionRequests from './auction-requests.js';
import renderAuctionRequestsReview from './auction-requests-review.js';
import renderAuctioneerAnalytics from './auctioneer-analytics.js';
import { loadDashboardTab, getDashboardTabs } from '../features/dashboard/tabs.js';
import '../features/dashboard/index.js';

const loadedTabs = new Set();

window.addEventListener('dashboard-tab-changed', (e) => {
  const { tabId, firstLoad } = e.detail;
  if (loadedTabs.has(tabId) && !firstLoad) return;
  loadedTabs.add(tabId);
  const content = document.getElementById(`dashTab_${tabId}`);
  if (!content) return;
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const route = { path: '/dashboard' };
  switch (tabId) {
    case 'auction-requests': if (typeof renderAuctionRequests === 'function') renderAuctionRequests(content, route, params); break;
    case 'auction-requests-review': if (typeof renderAuctionRequestsReview === 'function') renderAuctionRequestsReview(content, route, params); break;
    case 'auctioneer-analytics': if (typeof renderAuctioneerAnalytics === 'function') renderAuctioneerAnalytics(content, route, params); break;
    default: loadDashboardTab(tabId, content); break;
  }
});

export default async function renderDashboard(container, _route, _params) {
  if (!(await requireAuth())) return;

  const tabs = getDashboardTabs();

  container.innerHTML = `
    <style>
      .tour-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--overlay);
        backdrop-filter: blur(5px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tour-modal {
        max-width: 420px;
        width: 90%;
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        padding: var(--space-6);
        transform: scale(1);
        transition: all 0.3s ease;
      }
      .tour-highlight {
        position: relative;
        z-index: 99998 !important;
        box-shadow: 0 0 0 6px var(--primary), var(--shadow-hover) !important;
        transform: scale(1.02);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        background: var(--card-bg) !important;
      }
    </style>
    <div x-data="dashboardPage" x-init="init()">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="dashboard-sidebar">
            ${tabs.map(tabItem => `
              <a href="#/dashboard${tabItem.id === 'overview' ? '' : `?tab=${  tabItem.id}`}"
                 class="dash-link"
                 :class="{ active: activeTab === '${tabItem.id}' }"
                 @click.prevent="switchTab('${tabItem.id}')">
                <i class="fas ${tabItem.icon}" aria-hidden="true"></i> ${tabItem.label}
              </a>
            `).join('')}
          </div>
        </div>
        <div class="col-md-9">
          <div class="dash-mobile-tabs">
            <select class="form-select" aria-label="${t('dash.tabsLabel')}" x-model="activeTab" @change="switchTab(activeTab)">
              ${tabs.map(tabItem => `<option value="${tabItem.id}">${tabItem.label}</option>`).join('')}
            </select>
          </div>
          <div class="dashboard-content">
            ${tabs.map(tabItem => `
              <div id="dashTab_${tabItem.id}" x-show="activeTab === '${tabItem.id}'" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100"></div>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="dash-bottom-bar">
        ${tabs.map(tabItem => `
          <a href="#/dashboard${tabItem.id === 'overview' ? '' : `?tab=${  tabItem.id}`}"
             class="dash-bottom-link"
             :class="{ active: activeTab === '${tabItem.id}' }"
             @click.prevent="switchTab('${tabItem.id}')"
             title="${tabItem.label}">
            <i class="fas ${tabItem.icon}" aria-hidden="true"></i><span>${tabItem.label}</span>
          </a>
        `).join('')}
      </div>

      <!-- Onboarding Tour Overlay -->
      <div x-show="showTour" class="tour-backdrop" x-cloak x-transition>
        <div class="tour-modal animate-on-scroll">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="m-0 text-primary" style="display:flex;align-items:center;gap:8px">
              <i class="fas fa-compass" aria-hidden="true"></i>
              <span x-text="getTourSteps()[tourStep].title"></span>
            </h4>
            <button class="btn btn-close" style="font-size:1.5rem;background:transparent;border:none;color:var(--text-muted);cursor:pointer" @click="endTour()">&times;</button>
          </div>
          <div class="tour-body">
            <p class="text-muted" style="line-height:1.6" x-text="getTourSteps()[tourStep].desc"></p>
            <div class="d-flex justify-content-between align-items-center mt-4">
              <span class="text-muted" style="font-size:0.85rem">
                ${t('common.step')} <span x-text="tourStep + 1"></span> of <span x-text="getTourSteps().length"></span>
              </span>
              <div class="d-flex gap-2">
                <button class="btn btn-outline btn-sm" @click="prevTourStep()" :disabled="tourStep === 0">${t('common.back')}</button>
                <button class="btn btn-primary btn-sm" @click="nextTourStep()" x-text="tourStep === getTourSteps().length - 1 ? '${t('common.finish')}' : '${t('common.next')}'"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  registerRouteCleanup(() => {
    document.body.classList.remove('has-bottom-bar');
    document.body.classList.remove('has-floating-bar');
  });
}


