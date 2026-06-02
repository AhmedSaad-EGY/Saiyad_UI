/**
 * SEO meta-tag manager for Sayiad.
 *
 * Usage:
 *   setPageMeta('Home', "Egypt's premier fishing marketplace.");
 *
 * Calling with no args applies site-wide defaults.
 */

function setPageMeta(title, description) {
  document.title = title
    ? title + ' — Sayiad'
    : 'Sayiad - Fishing Marketplace & Auctions';

  const desc = description || "Egypt's premier fishing marketplace.";
  const set = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  set('meta[name="description"]',         'content', desc);
  set('meta[property="og:title"]',        'content', document.title);
  set('meta[property="og:description"]',  'content', desc);
  set('link[rel="canonical"]',            'href',    window.location.href.split('#')[0]);
}

export { setPageMeta };
