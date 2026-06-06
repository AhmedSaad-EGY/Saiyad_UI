import { t, getCurrentLang } from '../i18n/index.js';

export function getLocale() {
  return getCurrentLang() === "ar" ? "ar-EG" : "en-US";
}

export function getCurrency() {
  return "EGP";
}

export function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString(getLocale(), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function formatPrice(n) {
  try {
    return new Intl.NumberFormat(getLocale(), {
      style: "currency",
      currency: getCurrency(),
    }).format(n || 0);
  } catch {
    return `$${Number(n || 0).toFixed(2)}`;
  }
}

export function statusClass(status) {
  const map = {
    0: "available",
    1: "sold",
    2: "draft",
    Available: "available",
    Sold: "sold",
    Draft: "draft",
    Rejected: "rejected",
    Suspended: "suspended",
    PendingReview: "pendingreview",
    Active: "active",
    Finished: "finished",
    Cancelled: "draft",
    Pending: "pending",
    Paid: "paid",
    Shipped: "shipped",
    Delivered: "available",
    Approved: "active",
    Valid: "active",
    Winning: "available",
  };
  return `status-${map[status] || "draft"}`;
}

export function tStatus(status, prefix = "order") {
  if (status == null) return "";
  const numMap = ["Available", "Sold", "Draft", "Rejected", "Suspended", "PendingReview"];
  const label =
    typeof status === "number" ? (numMap[status] ?? status) : status;
  const key = `${prefix}.status${label}`;
  const translated = t(key);
  return translated || label;
}

export function tCondition(condition) {
  if (condition == null || condition === "") return t("common.N/A");
  const labels = {
    0: "New",
    1: "Used",
    New: "New",
    Used: "Used",
  };
  const label = labels[condition] || condition;
  const key = `product.condition${label}`;
  const translated = t(key);
  return translated || label;
}

export function renderStars(rating) {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) - full >= 0.5;
  return (
    "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0))
  );
}
