/**
 * Role constants and role sets for the Sayiad platform.
 * Import from this file instead of using hardcoded role strings.
 */

export const ROLES = Object.freeze({
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
  FISHERMAN: 'Fisherman',
  BAIT_SELLER: 'BaitSeller',
  AUCTIONEER: 'Auctioneer',
});

export const SELLER_ROLES = [ROLES.FISHERMAN, ROLES.BAIT_SELLER];
export const ECOMMERCE_ROLES = [ROLES.CUSTOMER, ROLES.FISHERMAN, ROLES.BAIT_SELLER, ROLES.AUCTIONEER];
export const MODERATOR_ROLES = [ROLES.AUCTIONEER, ROLES.ADMIN];
