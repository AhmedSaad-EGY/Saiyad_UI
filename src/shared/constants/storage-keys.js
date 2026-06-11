/**
 * Shared localStorage key constants.
 *
 * All modules MUST read/write tokens through these constants.
 * Before the introduction of this file, three separate modules used
 * different key names for the same logical tokens ('accessToken' vs
 * 'sayiad_accessToken', etc.), which completely broke auth state.
 *
 * Usage:
 *   import { KEYS } from '../constants/storage-keys.js';
 *   localStorage.getItem(KEYS.ACCESS_TOKEN);
 *   localStorage.setItem(KEYS.USER, JSON.stringify(user));
 */
export const KEYS = Object.freeze({
  ACCESS_TOKEN: 'sayiad_accessToken',
  REFRESH_TOKEN: 'sayiad_refreshToken',
  USER: 'sayiad_user',
  THEME: 'sayiad_theme',
  LANG: 'sayiad_lang',
});
