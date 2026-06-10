import { requireAuth } from '../features/auth/login.js';
import '../features/checkout/checkout.js';
import { renderCheckoutLoading, renderCheckoutEmpty } from '../widgets/checkout/render-states.js';
import { renderCheckoutForm } from '../widgets/checkout/render-checkout-form.js';
import { renderCheckoutSuccess } from '../widgets/checkout/render-success.js';

export default async function renderCheckout(container) {
  if (!(await requireAuth())) return;

  container.innerHTML = `
    <div x-data="checkoutPage">
      <template x-if="loading">${renderCheckoutLoading()}</template>
      <div x-show="!loading && items.length === 0" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        ${renderCheckoutEmpty()}
      </div>
      <div x-show="!loading && items.length > 0 && !orderSuccess" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        ${renderCheckoutForm()}
      </div>
      <div x-show="orderSuccess" style="display:none" x-transition:enter="transition-fade" x-transition:enter-start="op-0" x-transition:enter-end="op-100">
        ${renderCheckoutSuccess()}
      </div>
    </div>`;
}
