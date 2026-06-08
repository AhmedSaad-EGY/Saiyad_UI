import { escapeHtml } from '../../shared/utils/dom.js';

export function renderGallery(p) {
  return `<div class="col-lg-6">
    <div class="detail-image p-0 image-magnifier-wrap" id="mainImageWrap">
      ${p.primaryImageUrl ? `<img src="${escapeHtml(p.primaryImageUrl)}" id="mainImg" alt="${escapeHtml(p.title)}" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async" fetchpriority="high"><div class="magnifier-lens" id="magLens"></div>` : '<i class="fas fa-image"></i>'}
      <div class="rounded-circle d-flex align-items-center justify-content-center" style="position:absolute;bottom:12px;right:12px;background:var(--overlay);color:var(--text-inverse);width:36px;height:36px;pointer-events:none"><i class="fas fa-search-plus"></i></div>
    </div>
  </div>`;
}
