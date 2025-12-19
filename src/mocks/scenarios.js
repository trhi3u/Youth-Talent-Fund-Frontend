const clone = data => JSON.parse(JSON.stringify(data));

const devUser = {
  id: 'user-001',
  name: 'Nguyen Van A',
  email: 'user@example.com',
  phone: '0901234567',
  roles: ['ROLE_USER']
};

const devCampaigns = [
  {
    id: 'cmp-001',
    code: 'YTF-001',
    title: 'Hoc bong cong nghe cho sinh vien nam 3',
    description: 'Ho tro hoc bong va mentoring 6 thang cho 20 ban sinh vien nam 3 chuyen nganh CNTT.',
    goal: 50000000,
    raised: 18500000,
    status: 'IN_PROGRESS',
    category: 'Giáo dục',
    categoryResponse: { name: 'Giáo dục' },
    coverImage:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
    totalDonations: 120
  },
  {
    id: 'cmp-002',
    code: 'YTF-002',
    title: 'Tai nang tre am nhac duong pho',
    description: 'Goi quang ba va tap huan 3 thang cho 5 ban tre theo duoi am nhac duong pho.',
    goal: 30000000,
    raised: 12000000,
    status: 'IN_PROGRESS',
    category: 'Nghệ thuật',
    categoryResponse: { name: 'Nghệ thuật' },
    coverImage:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
    totalDonations: 64
  },
  {
    id: 'cmp-003',
    code: 'YTF-003',
    title: 'Du an robot cho hoc sinh cap 3',
    description: 'Tai tro linh kien va huan luyen lap trinh robot thi dau cap tinh.',
    goal: 45000000,
    raised: 45000000,
    status: 'COMPLETED',
    category: 'Khoa học - Kỹ thuật',
    categoryResponse: { name: 'Khoa học - Kỹ thuật' },
    coverImage:
      'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1200&q=80',
    endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    totalDonations: 201
  }
];

const devDonations = [
  {
    id: 'don-001',
    campaignId: 'cmp-001',
    amount: 500000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'don-002',
    campaignId: 'cmp-002',
    amount: 1500000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  }
];

export const devScenario = {
  auth: {
    accessToken: 'dev-token-123',
    userInfo: devUser
  },
  campaigns: devCampaigns,
  profile: devUser,
  donations: devDonations
};

export const getDevCampaigns = () => clone(devScenario.campaigns);
export const getDevCampaignById = id => clone(devScenario.campaigns.find(c => c.id === id || c.code === id));
export const getDevProfile = () => clone(devScenario.profile);
export const getDevDonations = () => clone(devScenario.donations);
export const getDevAuthResponse = () => clone({
  accessToken: devScenario.auth.accessToken,
  userInfo: devScenario.auth.userInfo,
  role: devScenario.auth.userInfo?.roles?.[0] || ''
});

export const appendDevDonation = donation => {
  devScenario.donations.unshift({ ...donation });
};
