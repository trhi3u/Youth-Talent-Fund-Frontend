import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

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
      meta: { requiresRole: 'USER' },
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
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/pages/Admin/AdminDashboard.vue') },
        { path: 'campaigns', name: 'admin-campaigns', component: () => import('@/pages/Admin/CampaignManagement.vue') },
        { path: 'campaigns/create', name: 'admin-campaign-create', component: () => import('@/pages/Admin/CampaignCreate.vue') },
        { path: 'campaigns/:id/edit', name: 'admin-campaign-edit', component: () => import('@/pages/Admin/CampaignEdit.vue') },
        { path: 'staff', name: 'admin-staff', component: () => import('@/pages/Admin/StaffManagement.vue') },
        { path: 'assign', name: 'admin-assign', component: () => import('@/pages/Admin/AssignStaff.vue') }
      ]
    },
    {
      path: '/staff',
      meta: { requiresRole: 'STAFF' },
      children: [
        { path: '', redirect: '/staff/dashboard' },
        { path: 'dashboard', name: 'staff-dashboard', component: () => import('@/pages/Staff/StaffDashboard.vue') },
        { path: 'campaigns', name: 'staff-campaigns', component: () => import('@/pages/Staff/StaffCampaigns.vue') },
        { path: 'campaigns/create', name: 'staff-campaign-create', component: () => import('@/pages/Staff/CampaignCreate.vue') },
        { path: 'campaigns/:id/edit', name: 'staff-campaign-edit', component: () => import('@/pages/Staff/CampaignEdit.vue') },
        { path: 'campaigns/:id/update', name: 'staff-update-campaign', component: () => import('@/pages/Staff/StaffUpdateCampaign.vue') },
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

const normalizeRole = role => (role || '').replace(/^ROLE_/i, '').toUpperCase();

const roleMatches = (required, actual) => {
  if (!required) return true;
  return normalizeRole(required) === normalizeRole(actual);
};


router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const requiredRole = to.meta.requiresRole;

  console.log('[Router] Navigation to:', to.path, 'requiredRole:', requiredRole);

  if (!requiredRole) return next();

  const role = normalizeRole(auth.role || auth.userInfo?.roles?.[0]);
  console.log('[Router] Auth check - token:', Boolean(auth.token), 'role:', role, 'required:', requiredRole);
  
  if (!role || !auth.token || !roleMatches(requiredRole, role)) {
    console.log('[Router] Access denied, redirecting to:', roleRedirect[normalizeRole(requiredRole)] || '/login');
    return next(roleRedirect[normalizeRole(requiredRole)] || '/login');
  }

  console.log('[Router] Access granted');
  return next();
});

export default router;
