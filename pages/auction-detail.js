async function renderAuctionDetail(container, route, params) {
  const id = params.id;
  if (!id) { showError(container, 'Auction ID is required.'); return; }

  showLoading(container, 'detail');

  try {
    const detail = await api.get(`/auctions/${id}`);
    const a = detail.auction || detail;
    const bids = detail.bids || [];
    let end = new Date(a.endTime);
    let isActive = a.status === 'Active';

        trackRecentlyViewed(a.id, a.productTitle || 'Auction Item', a.productImageUrl, a.currentHighestBid || a.startingPrice, "auction");
    joinAuctionGroup(parseInt(id));

    window.onRouteCleanup = () => {
      leaveAuctionGroup(parseInt(id));
    };

    function render(a) {
          const now = new Date();
          const remaining = Math.max(0, Math.floor((end - now) / 1000));
          const urgent = remaining > 0 && remaining <= 3600;
          const days = Math.floor(remaining / 86400);
          const hours = Math.floor((remaining % 86400) / 3600);
          const mins = Math.floor((remaining % 3600) / 60);
          const secs = remaining % 60;

      const title = a.productTitle || 'Auction Item';

      container.innerHTML = `
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">${t("nav.home")}</a> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <a href="#/auctions">${t("nav.auctions")}</a> <i class="fas fa-chevron-${getCurrentLang() === "ar" ? "left" : "right"}" aria-hidden="true"></i> <span>${escapeHtml(title)}</span></nav>
        <div class="detail-page">
          <div>
            <div class="detail-image">
              ${a.productImageUrl ? `<img src="${a.productImageUrl}" alt="${escapeHtml(title)}" style="width:100%;height:100%;object-fit:cover">` : '<i class="fas fa-gavel"></i>'}
            </div>
          </div>
          <div class="detail-info" style="animation:slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)">
            <h1>${escapeHtml(title)}</h1>
            <div class="current-bid" id="currentBidDisplay" data-auction-id="${a.id}">${t('auction.currentBid')}: ${formatPrice(a.currentHighestBid || a.startingPrice)}</div>
            <div style="margin:12px 0">
              <span class="status ${statusClass(a.status)}">${a.status}</span>
              ${remaining > 0 ? `
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px" id="countdownContainer">
                ${days > 0 ? `<div class="countdown-unit"><span class="countdown-num">${days}</span><span class="countdown-lbl">days</span></div>` : ''}
                <div class="countdown-unit ${urgent ? 'urgent' : ''}"><span class="countdown-num" id="cd-hours">${String(hours).padStart(2,'0')}</span><span class="countdown-lbl">hrs</span></div>
                <div class="countdown-unit ${urgent ? 'urgent' : ''}"><span class="countdown-num" id="cd-mins">${String(mins).padStart(2,'0')}</span><span class="countdown-lbl">min</span></div>
                <div class="countdown-unit ${urgent ? 'urgent' : ''}"><span class="countdown-num" id="cd-secs">${String(secs).padStart(2,'0')}</span><span class="countdown-lbl">sec</span></div>
                ${urgent ? `<span class="ending-soon-badge">${t('auction.endingSoon')}</span>` : ''}
              </div>` : `<span style="color:var(--danger);font-weight:600"><i class="fas fa-times-circle"></i> ${t('auction.ended')}</span>`}
            </div>
            <div class="detail-meta">
              <div class="detail-meta-item"><strong>${t('auction.startingPrice')}:</strong> ${formatPrice(a.startingPrice)}</div>
              <div class="detail-meta-item"><strong>${t('auction.reservePrice')}:</strong> ${a.reservePrice ? formatPrice(a.reservePrice) : t('common.N/A')}</div>
              <div class="detail-meta-item"><strong>${t('auction.minIncrement')}:</strong> ${formatPrice(a.minimumIncrement)}</div>
              <div class="detail-meta-item"><strong>${t('auction.totalBids')}:</strong> <span id="bidCountDisplay">${bids.length}</span></div>
              <div class="detail-meta-item"><strong>${t('auction.start')}:</strong> ${formatDate(a.startTime)}</div>
              <div class="detail-meta-item"><strong>${t('auction.end')}:</strong> ${formatDate(a.endTime)}</div>
            </div>
            ${a.winnerUserId ? `<div class="alert alert-success"><i class="fas fa-trophy"></i> ${t('auction.winner')}: ${escapeHtml(a.winnerName || `User #${a.winnerUserId}`)}</div>` : ''}

            ${isActive ? `
              <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px">
                <div style="flex:1;min-width:200px">
                  <div class="bid-input-group">
                    <input type="number" class="form-input" id="bidAmount" step="0.01" placeholder="${t('auction.placeBid')}" />
                    <button class="btn btn-primary" id="placeBidBtn"><i class="fas fa-gavel"></i> ${t('auction.placeBid')}</button>
                  </div>
                  <div class="bid-slider-wrap">
                    <input type="range" class="bid-slider" id="bidSlider" min="0" max="1000" step="0.01" value="0" aria-label="Bid amount slider">
                    <div class="bid-slider-labels"><span id="sliderMin"></span><span id="sliderMax"></span></div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
                    <label style="display:flex;align-items:center;gap:6px;font-size:var(--text-sm);cursor:pointer">
                      <input type="checkbox" id="autoBidToggle"> <i class="fas fa-robot"></i> Auto-bid
                    </label>
                    <div id="autoBidMaxWrap" class="hidden" style="flex:1">
                      <input type="number" class="form-input" id="autoBidMax" step="0.01" min="0" placeholder="Max bid amount" style="padding:6px 10px;font-size:var(--text-sm)">
                    </div>
                  </div>
                </div>
              </div>
              <div id="bidAlert"></div>
            ` : ''}

            <div style="margin-top:24px">
              <h3>${t('auction.bidHistory')} (${bids.length})</h3>
              <div class="bid-list" id="bidList">
                ${bids.length ? bids.sort((a,b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)).map(b => `
                  <div class="bid-item"><span><strong>${escapeHtml(b.userName || `User #${b.userId}`)}</strong> <small>${formatDate(b.createdAt || b.created_at)}</small></span><span style="font-weight:700;color:var(--success)">${formatPrice(b.amount)} ${b.isAutoBid ? '<i class="fas fa-robot" title="Auto bid"></i>' : ''}</span></div>
                `).join('') : `<div class="empty-state"><i class="fas fa-gavel"></i><h3>${t('auction.noBids')}</h3></div>`}
              </div>
            </div>
          </div>
        </div>
      `;
      observeAnimations();

      if (isActive) {
        // Bid slider ↔ input sync
        const bidInput = document.getElementById('bidAmount');
        const bidSlider = document.getElementById('bidSlider');
        const sliderMin = document.getElementById('sliderMin');
        const sliderMax = document.getElementById('sliderMax');
        const minBid = a.currentHighestBid ? a.currentHighestBid + a.minimumIncrement : a.startingPrice;
        const maxBid = minBid * 10;
        if (bidSlider) {
          bidSlider.min = minBid;
          bidSlider.max = maxBid;
          bidSlider.value = minBid;
          bidInput.placeholder = `${t('auction.placeBid')} (${formatPrice(minBid)})`;
          if (sliderMin) sliderMin.textContent = formatPrice(minBid);
          if (sliderMax) sliderMax.textContent = formatPrice(maxBid);
          bidSlider.addEventListener('input', () => { bidInput.value = parseFloat(bidSlider.value).toFixed(2); });
          bidInput.addEventListener('input', () => {
            const v = parseFloat(bidInput.value);
            if (!isNaN(v) && v >= minBid && v <= maxBid) bidSlider.value = v;
          });
        }

        const timer = setInterval(() => {
          const diff = Math.max(0, Math.floor((end - new Date()) / 1000));
          if (diff <= 0) {
            clearInterval(timer);
            isActive = false;
            const container = document.getElementById('countdownContainer');
            if (container) container.innerHTML = `<span style="color:var(--danger);font-weight:600"><i class="fas fa-times-circle"></i> ${t('auction.ended')}</span>`;
            return;
          }
          const h = Math.floor((diff % 86400) / 3600);
          const m = Math.floor((diff % 3600) / 60);
          const s = diff % 60;
          const hEl = document.getElementById('cd-hours');
          const mEl = document.getElementById('cd-mins');
          const sEl = document.getElementById('cd-secs');
          if (hEl) hEl.textContent = String(h).padStart(2, '0');
          if (mEl) mEl.textContent = String(m).padStart(2, '0');
          if (sEl) sEl.textContent = String(s).padStart(2, '0');
        }, 1000);

        document.getElementById('autoBidToggle')?.addEventListener('change', (e) => {
          document.getElementById('autoBidMaxWrap')?.classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('placeBidBtn').addEventListener('click', async () => {
          if (!await requireAuth()) return;
          const amount = parseFloat(document.getElementById('bidAmount').value);
          if (!amount || amount <= 0) { document.getElementById('bidAlert').innerHTML = `<div class="alert alert-error">${t('auction.invalidBid')}</div>`; return; }
          const btn = document.getElementById('placeBidBtn');
          btn.disabled = true;
          btn.innerHTML = `<i class="fas fa-spinner spinner"></i> ${t('auction.placingBid')}`;
          document.getElementById('bidAlert').innerHTML = '';
          try {
            const body = { amount };
            if (document.getElementById('autoBidToggle')?.checked) {
              const maxBid = parseFloat(document.getElementById('autoBidMax')?.value);
              if (maxBid && maxBid > amount) body.maxAutoBidAmount = maxBid;
            }
            await api.post(`/auctions/${id}/bids`, body);
            document.getElementById('bidAlert').innerHTML = `<div class="alert alert-success">${t('auction.bidPlaced')}</div>`;
            setTimeout(() => router(), 1000);
          } catch (e) {
            document.getElementById('bidAlert').innerHTML = `<div class="alert alert-error">${escapeHtml(e.message)}</div>`;
          } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-gavel"></i> ${t('auction.placeBid')}`;
          }
        });

        // Auto-refresh bid data every 10s
        const refreshTimer = setInterval(async () => {
          try {
            const freshData = await api.get(`/auctions/${id}`);
            const fresh = freshData.auction || freshData;
            end = new Date(fresh.endTime);
            isActive = fresh.status === 'Active';
            const bidDisplay = document.getElementById('currentBidDisplay');
            if (bidDisplay) {
              const oldText = bidDisplay.textContent;
              const newText = `${t('auction.currentBid')}: ${formatPrice(fresh.currentHighestBid || fresh.startingPrice)}`;
              if (oldText !== newText) {
                bidDisplay.style.animation = 'none';
                bidDisplay.offsetHeight;
                bidDisplay.style.animation = 'priceFlash 0.5s var(--ease-bounce)';
                showToast(t('auction.newBid'), 'info');
              }
              bidDisplay.innerHTML = newText;
            }
            const countEl = document.getElementById('bidCountDisplay');
            if (countEl) countEl.textContent = (fresh.bids || []).length;
            if (!isActive) { clearInterval(refreshTimer); clearInterval(timer); router(); }
          } catch {}
        }, 10000);
      }
    }

    render(a);
  } catch (e) {
    showError(container, e.message);
  }
}
