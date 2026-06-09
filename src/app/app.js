import { syncVipAttribute } from '../features/auth/login.js';

import './theme.js';
import './language.js';
import './navbar.js';
import './global-ui.js';
import './swipe-back.js';
import './offline.js';
import './tour.js';
import './sw.js';

syncVipAttribute().catch(err => console.warn('VIP sync failed:', err));
