import { syncVipAttribute } from '../features/auth/login.js';
import { isAuthenticated } from './auth-state.js';

import './theme.js';
import './language.js';
import './navbar.js';
import './global-ui.js';
import './swipe-back.js';
import './offline.js';
import './tour.js';
import './sw.js';

if (isAuthenticated()) syncVipAttribute().catch(() => {});
