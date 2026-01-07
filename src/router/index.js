import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const normalizeRole = role => {
  if (role && typeof role === 'object') {
    const candidate = role.authority || role.role || role.name || role.code || role.id || '';
    return normalizeRole(candidate);
  }
  return (role || '').toString().trim().replace(/^ROLE_/i, '').toUpperCase();
};

const pickRole = roles => {
  const list = Array.isArray(roles) ? roles.map(normalizeRole) : [];
  if (list.includes('STAFF')) return 'STAFF';
  if (list.includes('ADMIN')) return 'ADMIN';
  if (list.includes('USER')) return 'USER';
  return normalizeRole(list[0] || roles?.[0]);
};

const roleMatches = (required, actual) => {
  if (!required) return true;
  return normalizeRole(required) === normalizeRole(actual);
};

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/Home/Home.vue') },
    { path: '/about', name: 'about', component: () => import('@/pages/Home/AboutUs.vue') },
    { path: '/campaigns', name: 'campaigns', component: () => import('@/pages/Home/CampaignList.vue') },
    { path: '/campaign/:id', name: 'campaign-detail', component: () => import('@/pages/Home/CampaignDetail.vue') },
    { path: '/donate/:id', name: 'donate', component: () => import('@/pages/Home/Donate.vue') },

    { path: '/login', name: 'login', component: () => import('@/pages/Auth/Login.vue') },
    { path: '/register', name: 'register', component: () => import('@/pages/Auth/Register.vue') },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('@/pages/Auth/ForgotPassword.vue') },
    { path: '/adminLogin', name: 'admin-login', component: () => import('@/pages/Auth/AdminLogin.vue') },
    { path: '/staffLogin', name: 'staff-login', component: () => import('@/pages/Auth/StaffLogin.vue') },

    {
      path: '/user',
      children: [
        { path: '', redirect: '/user/profile' },
        { path: 'profile', name: 'user-profile', component: () => import('@/pages/User/Profile.vue') },
        { path: 'donations', name: 'user-donations', component: () => import('@/pages/User/DonationHistory.vue') },
        { path: 'change-password', name: 'user-change-password', component: () => import('@/pages/User/ChangePassword.vue') }
      ]
    },
    {
      path: '/admin',
      meta: { requiresRole: 'ADMIN' },
      component: () => import('@/pages/Admin/AdminLayout.vue'),
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/pages/Admin/AdminDashboard.vue') },
        { path: 'campaigns', name: 'admin-campaigns', component: () => import('@/pages/Admin/CampaignManagement.vue') },
        { path: 'campaigns/create', name: 'admin-campaign-create', component: () => import('@/pages/Admin/CampaignCreate.vue') },
        { path: 'campaigns/:id/edit', name: 'admin-campaign-edit', component: () => import('@/components/campaign/CampaignEdit.vue') },
        { path: 'CampaignsEdit/:campaignCode', name: 'admin-campaign-edit-alt', component: () => import('@/components/campaign/CampaignEdit.vue') },
        { path: 'campaigns/:campaignCode', name: 'admin-campaign-detail', component: () => import('@/components/campaign/CampaignDetail.vue') },
        { path: 'staff', name: 'admin-staff', component: () => import('@/pages/Admin/StaffManagement.vue') },
        { path: 'staff/:staffCode', name: 'admin-staff-detail', component: () => import('@/pages/Admin/StaffDetail.vue') },
        { path: 'assign', name: 'admin-assign', component: () => import('@/pages/Admin/AssignCampaignToStaff.vue') },
        { path: 'analytics', name: 'admin-analytics', component: () => import('@/pages/Admin/Analytics.vue') }
      ]
    },
    {
      path: '/staff',
      meta: { requiresRole: 'STAFF' },
      component: () => import('@/pages/Staff/StaffLayout.vue'),
      children: [
        { path: '', redirect: '/staff/dashboard' },
        { path: 'dashboard', name: 'staff-dashboard', component: () => import('@/pages/Staff/StaffDashboard.vue') },
        { path: 'campaigns', name: 'staff-campaigns', component: () => import('@/pages/Staff/StaffCampaigns.vue') },
        { path: 'campaigns/create', name: 'staff-campaign-create', component: () => import('@/pages/Staff/CampaignCreate.vue') },
        { path: 'campaigns/:id/edit', name: 'staff-campaign-edit', component: () => import('@/components/campaign/CampaignEdit.vue') },
        { path: 'CampaignsEdit/:campaignCode', name: 'staff-campaign-edit-alt', component: () => import('@/components/campaign/CampaignEdit.vue') },
        { path: 'campaigns/:campaignCode', name: 'staff-campaign-detail', component: () => import('@/pages/Staff/CampaignDetail.vue') },
        { path: 'reports', name: 'staff-reports', component: () => import('@/pages/Staff/Reports&Analytics.vue') }
      ]
    }
  ]
});

const roleRedirect = {
  USER: '/login',
  ADMIN: '/adminLogin',
  STAFF: '/staffLogin'
};

const roleHome = {
  USER: '/user',
  ADMIN: '/admin',
  STAFF: '/staff'
};


router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const requiredRole = to.meta.requiresRole;

  // Rehydrate auth from storage if store is empty (e.g., page reload)
  if (!auth.token) {
    try {
      const cached = JSON.parse(localStorage.getItem('auth_state_v1') || sessionStorage.getItem('auth_state_v1') || '{}');
      if (cached?.token) {
        auth.token = cached.token;
        auth.role = normalizeRole(cached.role);
        auth.userInfo = cached.userInfo || null;
      }
    } catch (err) {
      console.warn('[Router] Failed to rehydrate auth state', err);
    }
  }

  console.log('[Router] Navigation to:', to.path, 'requiredRole:', requiredRole);

  const isAuthPage = ['/login', '/adminLogin', '/staffLogin', '/register'].includes(to.path);
  const currentRole = pickRole(auth.userInfo?.roles || [auth.role]);

  if (auth.token && isAuthPage) {
    const target = roleHome[currentRole] || '/';
    console.log('[Router] Already authenticated, redirecting from auth page to:', target, 'role:', currentRole);
    return next(target);
  }

  if (!requiredRole) return next();

  const role = currentRole;
  console.log('[Router] Auth check - token:', Boolean(auth.token), 'role:', role, 'required:', requiredRole);
  
  if (!role || !auth.token || !roleMatches(requiredRole, role)) {
    console.log('[Router] Access denied, redirecting to:', roleRedirect[normalizeRole(requiredRole)] || '/login');
    return next(roleRedirect[normalizeRole(requiredRole)] || '/login');
  }

  console.log('[Router] Access granted');
  return next();
});

export default router;
