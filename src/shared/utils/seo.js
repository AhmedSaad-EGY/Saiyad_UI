import { t } from '../../app/i18n.js';

/**
 * SEO meta-tag manager for Sayiad.
 *
 * Usage:
 *   setPageMeta('Home', "Egypt's premier fishing marketplace.");
 *
 * Calling with no args applies site-wide defaults.
 */

/**
 * @param {string} title
 * @param {string} [description]
 * @param {boolean} [noIndex=false] - Set true for auth-required / private pages
 */
function setPageMeta(title, description, noIndex = false) {
  document.title = title
    ? `${title} — Sayiad`
    : "Sayiad - Fishing Marketplace & Auctions";

  const desc = description || t('home.metaDesc');
  const set = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('meta[name="description"]', "content", desc);
  set('meta[property="og:title"]', "content", document.title);
  set('meta[property="og:description"]', "content", desc);
  set('link[rel="canonical"]', "href", window.location.href.split("#")[0]);

  // noindex for private/auth-required pages
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (!robotsMeta) {
    robotsMeta = document.createElement("meta");
    robotsMeta.name = "robots";
    document.head.appendChild(robotsMeta);
  }
  robotsMeta.content = noIndex ? "noindex,nofollow" : "index,follow";
}

export { setPageMeta };
