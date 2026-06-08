export function skeletonCard() {
  return `
    <div class="col">
      <div class="product-card card pe-none" aria-hidden="true">
        <div class="product-card-img skeleton-image-shim"></div>
        <div class="product-card-body p-3">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text" style="width:35%"></div>
        </div>
      </div>
    </div>`;
}

export const SKELETON_ROW_CLASSES = "row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-3 skeleton-shimmer";
export const CARD_ROW_CLASSES = "row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-3";
