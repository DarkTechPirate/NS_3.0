import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Calendar,
  Camera,
  Check,
  Clock3,
  Eye,
  FileText,
  Globe2,
  Heart,
  LineChart,
  Mail,
  MapPin,
  Search,
  Shield,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAdminInsights, getAdminUsers, verifyAdminUser } from '../services/api';
import { getBackendBaseUrl } from '../utils/backendUrl';

const SCREEN_OPTIONS = [
  {
    key: 'profiles',
    label: 'Profiles',
    subtitle: 'Review and verify member profiles',
    Icon: Users,
  },
  {
    key: 'matches',
    label: 'Matches',
    subtitle: 'Track match volume and quality',
    Icon: Heart,
  },
  {
    key: 'usage',
    label: 'Usage',
    subtitle: 'Monitor platform activity and traffic',
    Icon: Activity,
  },
  {
    key: 'logins',
    label: 'Logins',
    subtitle: 'See who logged in and how often',
    Icon: LineChart,
  },
  {
    key: 'locations',
    label: 'Locations',
    subtitle: 'Understand top cities and states',
    Icon: Globe2,
  },
];

const VIEW_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
];

const formatDate = (value) => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'N/A';
  }
};

const getImageUrl = (path, backendBaseUrl) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;

  const cleanPath = String(path).replace(/^\/?uploads\//, '');
  return `${backendBaseUrl}/uploads/${cleanPath}`;
};

const toneClasses = {
  slate: 'bg-slate-100 text-slate-700',
  amber: 'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700',
  blue: 'bg-blue-100 text-blue-700',
};

const MetricCard = ({ title, value, Icon, tone = 'slate', hint }) => (
  <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_8px_22px_rgba(17,24,39,0.06)]">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[11px] uppercase tracking-widest text-text-muted font-bold">{title}</p>
      <span className={`size-8 rounded-full flex items-center justify-center ${toneClasses[tone] || toneClasses.slate}`}>
        <Icon size={14} />
      </span>
    </div>
    <p className="text-3xl font-bold text-text-charcoal mt-3">{value}</p>
    {hint ? <p className="text-xs text-text-muted mt-1">{hint}</p> : null}
  </article>
);

const TopList = ({ title, helper, items }) => {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_22px_rgba(17,24,39,0.06)]">
      <h3 className="text-lg font-bold text-text-charcoal">{title}</h3>
      {helper ? <p className="text-xs text-text-muted mt-1">{helper}</p> : null}

      {items.length === 0 ? (
        <p className="text-sm text-text-muted mt-5">No data available yet.</p>
      ) : (
        <div className="space-y-3 mt-5">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-text-charcoal">{item.label}</span>
                <span className="text-text-muted">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-rose-300"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const EmptyStatePanel = ({ title, description }) => (
  <div className="bg-white rounded-3xl p-14 text-center border border-stone-200 shadow-[0_10px_28px_rgba(17,24,39,0.07)]">
    <div className="mx-auto size-16 bg-stone-100 rounded-full flex items-center justify-center mb-5 text-stone-400">
      <Check size={28} />
    </div>
    <h3 className="text-xl font-bold text-text-charcoal mb-2">{title}</h3>
    <p className="text-text-muted">{description}</p>
  </div>
);

const AdminDashboard = () => {
  const backendBaseUrl = getBackendBaseUrl();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [insights, setInsights] = useState(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');

  const screenParam = searchParams.get('screen');
  const activeScreen = SCREEN_OPTIONS.some((option) => option.key === screenParam)
    ? screenParam
    : 'profiles';

  const viewParam = searchParams.get('view');
  const view = VIEW_OPTIONS.some((option) => option.key === viewParam) ? viewParam : 'all';

  const setQueryParams = (updates) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  const setScreen = (nextScreen) => {
    if (nextScreen === activeScreen) return;
    if (nextScreen === 'profiles') {
      setQueryParams({ screen: nextScreen, view });
      return;
    }

    setQueryParams({ screen: nextScreen, view: null });
  };

  const setViewFilter = (nextView) => {
    setQueryParams({ screen: 'profiles', view: nextView });
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await getAdminUsers();
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch admin users', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError('');
      const res = await getAdminInsights();
      setInsights(res.data || null);
    } catch (error) {
      console.error('Failed to fetch admin insights', error);
      setInsightsError(typeof error === 'string' ? error : 'Failed to fetch admin insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchInsights();
  }, []);

  const handleVerify = async (userId, status) => {
    try {
      setActionLoading(true);
      await verifyAdminUser(userId, status);

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isVerified: status }
            : user
        )
      );

      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, isVerified: status } : prev));
      }

      fetchInsights();
    } catch (error) {
      console.error('Verification failed', error);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (view === 'pending' && user.isVerified) return false;
      if (view === 'verified' && !user.isVerified) return false;

      if (!query) return true;

      const haystack = [
        user.fullname,
        user.email,
        user.phone,
        user.personalDetails?.city,
        user.careerDetails?.profession,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [users, search, view]);

  const profileStats = useMemo(() => {
    const fromInsights = insights?.screens?.profiles;
    if (fromInsights) return fromInsights;

    const totalProfiles = users.length;
    const verifiedProfiles = users.filter((user) => user.isVerified).length;
    const pendingProfiles = totalProfiles - verifiedProfiles;
    const profilesWithPhotos = users.filter(
      (user) => Boolean(user.profilePicture) || (Array.isArray(user.profileImages) && user.profileImages.length > 0)
    ).length;

    return {
      totalProfiles,
      verifiedProfiles,
      pendingProfiles,
      profilesWithPhotos,
    };
  }, [insights, users]);

  const matchesScreen = insights?.screens?.matches || {
    totalMatches: 0,
    matchesLast7Days: 0,
    compatibilityBreakdown: { Strong: 0, Moderate: 0, Developing: 0 },
    recentMatches: [],
  };

  const usageScreen = insights?.screens?.usage || {
    totalConversations: 0,
    conversationsLast7Days: 0,
    totalMessages: 0,
    messagesLast24Hours: 0,
    totalNotifications: 0,
    averageMessagesPerConversation: 0,
    notificationTypeBreakdown: [],
  };

  const loginScreen = insights?.screens?.logins || {
    totalLoginEvents: 0,
    usersLoggedIn: 0,
    loginsLast7Days: 0,
    activeUsersLast30Days: 0,
    recentLoginUsers: [],
  };

  const locationsScreen = insights?.screens?.locations || {
    topProfileCities: [],
    topStates: [],
    topLoginCities: [],
    topLoginLocations: [],
  };

  const currentScreenLabel = SCREEN_OPTIONS.find((option) => option.key === activeScreen)?.label || 'Profiles';

  const renderScreenContent = () => {
    if (activeScreen === 'profiles') {
      return (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Total Profiles" value={profileStats.totalProfiles} Icon={Users} tone="slate" />
            <MetricCard title="Pending Review" value={profileStats.pendingProfiles} Icon={Clock3} tone="amber" />
            <MetricCard title="Verified" value={profileStats.verifiedProfiles} Icon={BadgeCheck} tone="emerald" />
            <MetricCard title="With Photos" value={profileStats.profilesWithPhotos} Icon={Camera} tone="fuchsia" />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5 shadow-[0_8px_22px_rgba(17,24,39,0.06)] flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, city, profession"
                className="w-full border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
            </div>

            <div className="flex items-center gap-2">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setViewFilter(option.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${view === option.key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-charcoal border-stone-200 hover:border-primary/40'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyStatePanel title="No profiles match this filter" description="Try changing filters or search keywords." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <article
                  key={user._id}
                  className="group rounded-[28px] border border-stone-200 bg-white overflow-hidden shadow-[0_8px_24px_rgba(17,24,39,0.08)] hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(190,24,93,0.15)] transition-all duration-300"
                >
                  <div className="h-24 bg-gradient-to-r from-primary via-primary to-rose-200 p-5">
                    <div className="flex items-start justify-between">
                      <div className="size-16 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0">
                        {user.profilePicture ? (
                          <img src={getImageUrl(user.profilePicture, backendBaseUrl)} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                            <UserIcon size={32} />
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${user.isVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 pt-9">
                    <h3 className="font-bold text-lg text-text-charcoal truncate">{user.fullname}</h3>
                    <p className="text-sm text-text-muted mb-4 truncate">{user.email}</p>

                    <div className="space-y-2 mb-5">
                      <p className="text-xs text-text-muted flex items-center gap-2">
                        <MapPin size={13} className="text-primary/80" />
                        <span>{user.personalDetails?.city || user.addresses?.[0]?.city || 'City not set'}</span>
                      </p>
                      <p className="text-xs text-text-muted flex items-center gap-2">
                        <Briefcase size={13} className="text-primary/80" />
                        <span>{user.careerDetails?.profession || 'Profession not set'}</span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-50 hover:bg-stone-100 text-text-charcoal font-semibold rounded-xl border border-stone-200 transition-all"
                      >
                        <Eye size={17} />
                        Review
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleVerify(user._id, !user.isVerified)}
                        className={`px-3 py-3 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50 ${user.isVerified ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                      >
                        {user.isVerified ? 'Set Pending' : 'Verify'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      );
    }

    if (insightsLoading) {
      return (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (insightsError) {
      return <EmptyStatePanel title="Unable to load insights" description={insightsError} />;
    }

    if (activeScreen === 'matches') {
      return (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Total Matches" value={matchesScreen.totalMatches} Icon={Heart} tone="fuchsia" />
            <MetricCard title="Created In 7 Days" value={matchesScreen.matchesLast7Days} Icon={Calendar} tone="blue" />
            <MetricCard title="Strong Compatibility" value={matchesScreen.compatibilityBreakdown?.Strong || 0} Icon={BadgeCheck} tone="emerald" />
            <MetricCard title="Developing Compatibility" value={matchesScreen.compatibilityBreakdown?.Developing || 0} Icon={Clock3} tone="amber" />
          </div>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_22px_rgba(17,24,39,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-charcoal">Recent Matches</h3>
              <span className="text-xs font-semibold text-text-muted">Last {matchesScreen.recentMatches?.length || 0} records</span>
            </div>

            {!matchesScreen.recentMatches?.length ? (
              <p className="text-sm text-text-muted">No match records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-stone-200">
                      <th className="py-3 pr-4">Pair</th>
                      <th className="py-3 pr-4">Cities</th>
                      <th className="py-3 pr-4">Compatibility</th>
                      <th className="py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchesScreen.recentMatches.map((match) => (
                      <tr key={match.id} className="border-b border-stone-100 last:border-0">
                        <td className="py-3 pr-4 font-medium text-text-charcoal">
                          {match.userName} <span className="text-text-muted">×</span> {match.matchedUserName}
                        </td>
                        <td className="py-3 pr-4 text-text-muted">
                          {match.userCity} • {match.matchedUserCity}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {match.compatibility}
                          </span>
                        </td>
                        <td className="py-3 text-text-muted">{formatDate(match.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      );
    }

    if (activeScreen === 'usage') {
      return (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <MetricCard title="Conversations" value={usageScreen.totalConversations} Icon={Users} tone="slate" />
            <MetricCard title="Conversations 7d" value={usageScreen.conversationsLast7Days} Icon={Calendar} tone="blue" />
            <MetricCard title="Messages" value={usageScreen.totalMessages} Icon={Activity} tone="fuchsia" />
            <MetricCard title="Messages 24h" value={usageScreen.messagesLast24Hours} Icon={Clock3} tone="amber" />
            <MetricCard title="Avg Msg / Conversation" value={usageScreen.averageMessagesPerConversation} Icon={BarChart3} tone="emerald" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TopList
              title="Notification Type Usage"
              helper={`Total notifications: ${usageScreen.totalNotifications}`}
              items={usageScreen.notificationTypeBreakdown || []}
            />

            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_22px_rgba(17,24,39,0.06)]">
              <h3 className="text-lg font-bold text-text-charcoal">Admin Usage Notes</h3>
              <ul className="mt-4 space-y-3 text-sm text-text-muted">
                <li>High messages with low conversations indicates deep engagement in fewer pairs.</li>
                <li>Track message spikes to monitor marketing push impact.</li>
                <li>Use verification and profile quality to improve match outcomes.</li>
              </ul>
            </section>
          </div>
        </section>
      );
    }

    if (activeScreen === 'logins') {
      return (
        <section className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Total Login Events" value={loginScreen.totalLoginEvents} Icon={LineChart} tone="blue" />
            <MetricCard title="Users Logged In" value={loginScreen.usersLoggedIn} Icon={Users} tone="emerald" />
            <MetricCard title="Logins In 7 Days" value={loginScreen.loginsLast7Days} Icon={Clock3} tone="amber" />
            <MetricCard title="Active In 30 Days" value={loginScreen.activeUsersLast30Days} Icon={BadgeCheck} tone="fuchsia" />
          </div>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_22px_rgba(17,24,39,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-charcoal">Recent Logged-In Members</h3>
              <span className="text-xs font-semibold text-text-muted">Most recent activity</span>
            </div>

            {!loginScreen.recentLoginUsers?.length ? (
              <p className="text-sm text-text-muted">No login records available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-stone-200">
                      <th className="py-3 pr-4">Member</th>
                      <th className="py-3 pr-4">Location</th>
                      <th className="py-3 pr-4">Login Count</th>
                      <th className="py-3">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginScreen.recentLoginUsers.map((user) => (
                      <tr key={user.id} className="border-b border-stone-100 last:border-0">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-text-charcoal">{user.fullname}</p>
                          <p className="text-xs text-text-muted">{user.email}</p>
                        </td>
                        <td className="py-3 pr-4 text-text-muted">{user.location || user.city || 'Unknown'}</td>
                        <td className="py-3 pr-4 text-text-charcoal font-semibold">{user.loginCount}</td>
                        <td className="py-3 text-text-muted">{formatDate(user.lastLoginAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      );
    }

    return (
      <section className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TopList
            title="Top Profile Cities"
            helper="Cities where most member profiles are created"
            items={locationsScreen.topProfileCities || []}
          />
          <TopList
            title="Top States"
            helper="Most represented states in profiles"
            items={locationsScreen.topStates || []}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TopList
            title="Top Login Cities"
            helper="Cities with highest logged-in member activity"
            items={locationsScreen.topLoginCities || []}
          />
          <TopList
            title="Top Login Locations"
            helper="Combined city/state snapshot from login events"
            items={locationsScreen.topLoginLocations || []}
          />
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f6f4]">
      <Header variant="authenticated" userName="Admin" />

      <main className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-44 -left-16 h-64 w-64 rounded-full bg-amber-200/25 blur-3xl"></div>
        </div>

        <section className="mb-8 rounded-[30px] border border-white/80 bg-white/95 backdrop-blur-sm shadow-[0_12px_36px_rgba(17,24,39,0.08)] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
                <Shield size={30} />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary/80 mb-1">Admin Command View</p>
                <h1 className="text-3xl md:text-4xl font-bold text-text-charcoal">Control Center</h1>
                <p className="text-text-muted mt-2 max-w-2xl">
                  Five admin screens for everything important: profiles, matches, usage, logins, and location intelligence.
                </p>
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/80">
              <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">Current Screen</p>
              <p className="text-lg font-bold text-text-charcoal mt-1">{currentScreenLabel}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {SCREEN_OPTIONS.map(({ key, label, subtitle, Icon }) => (
              <button
                key={key}
                onClick={() => setScreen(key)}
                className={`text-left rounded-2xl border p-4 transition-all ${activeScreen === key
                  ? 'bg-primary text-white border-primary shadow-[0_10px_24px_rgba(190,24,93,0.35)]'
                  : 'bg-white border-stone-200 hover:border-primary/40 hover:shadow-[0_8px_18px_rgba(17,24,39,0.08)]'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-sm font-bold ${activeScreen === key ? 'text-white' : 'text-text-charcoal'}`}>{label}</p>
                  <Icon size={16} className={activeScreen === key ? 'text-white' : 'text-primary'} />
                </div>
                <p className={`text-xs leading-relaxed ${activeScreen === key ? 'text-white/85' : 'text-text-muted'}`}>
                  {subtitle}
                </p>
              </button>
            ))}
          </div>
        </section>

        {renderScreenContent()}
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-charcoal">Review User: {selectedUser.fullname}</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                      <UserIcon size={14} /> Personal Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] text-text-muted uppercase">Age</p><p className="font-semibold">{selectedUser.age || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-text-muted uppercase">Gender</p><p className="font-semibold">{selectedUser.gender || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-text-muted uppercase">Religion</p><p className="font-semibold">{selectedUser.personalDetails?.religion || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-text-muted uppercase">Community</p><p className="font-semibold">{selectedUser.personalDetails?.community || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-text-muted uppercase">Marital Status</p><p className="font-semibold">{selectedUser.personalDetails?.maritalStatus || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-text-muted uppercase">Mother Tongue</p><p className="font-semibold">{selectedUser.personalDetails?.motherTongue || 'N/A'}</p></div>
                    </div>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                      <MapPin size={14} /> Contact & Location
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center gap-2"><Mail size={14} className="text-text-muted" /> {selectedUser.email || 'N/A'}</div>
                      <div className="flex items-center gap-2"><UserIcon size={14} className="text-text-muted" /> {selectedUser.phone || 'Phone not provided'}</div>
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-text-muted" /> {selectedUser.personalDetails?.city || selectedUser.addresses?.[0]?.city || 'City not provided'}</div>
                      <div className="flex items-center gap-2"><Calendar size={14} className="text-text-muted" /> Joined: {formatDate(selectedUser.createdAt)}</div>
                    </div>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                      <Briefcase size={14} /> Professional Details
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div><p className="text-[10px] text-text-muted uppercase">Education</p><p className="font-semibold">{selectedUser.careerDetails?.education || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-text-muted uppercase">Profession</p><p className="font-semibold">{selectedUser.careerDetails?.profession || 'N/A'}</p></div>
                      <div><p className="text-[10px] text-text-muted uppercase">Income</p><p className="font-semibold">{selectedUser.careerDetails?.income || 'N/A'}</p></div>
                    </div>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                      <Heart size={14} /> Lifestyle
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm mb-4">
                      <div><span className="text-text-muted">Diet:</span> <span className="font-semibold">{selectedUser.lifestyleDetails?.diet || 'N/A'}</span></div>
                      <div><span className="text-text-muted">Drinking:</span> <span className="font-semibold">{selectedUser.lifestyleDetails?.drinking || 'N/A'}</span></div>
                      <div><span className="text-text-muted">Smoking:</span> <span className="font-semibold">{selectedUser.lifestyleDetails?.smoking || 'N/A'}</span></div>
                      <div><span className="text-text-muted">Living Arrangement:</span> <span className="font-semibold">{selectedUser.lifestyleDetails?.livingArrangement || 'N/A'}</span></div>
                    </div>
                    <p className="font-medium text-sm leading-relaxed">{selectedUser.personalDetails?.about || 'No about section provided.'}</p>
                  </section>
                </div>

                <div className="space-y-8">
                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                      <Camera size={14} /> Uploaded Images
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedUser.profileImages?.length > 0 ? selectedUser.profileImages.map((img, i) => (
                        <div key={i} className="aspect-square bg-stone-100 rounded-2xl overflow-hidden border">
                          <img src={getImageUrl(img, backendBaseUrl)} className="w-full h-full object-cover" alt="" />
                        </div>
                      )) : (
                        <div className="col-span-2 p-10 bg-stone-50 rounded-2xl border border-dashed flex flex-col items-center text-stone-300">
                          <Camera size={40} className="mb-2" />
                          <p className="text-xs font-medium">No profile images</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <h4 className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                      <FileText size={14} /> ID Documents / Jathagam
                    </h4>
                    {selectedUser.personalDetails?.jathagam ? (
                      <div className="p-4 bg-stone-50 rounded-2xl border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl border shadow-sm text-primary">
                            <FileText size={20} />
                          </div>
                          <span className="text-xs font-bold text-text-charcoal truncate max-w-[150px]">VerificationDoc.pdf</span>
                        </div>
                        <a
                          href={getImageUrl(selectedUser.personalDetails.jathagam, backendBaseUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-white border text-primary text-[11px] font-bold rounded-lg hover:shadow-md transition-all"
                        >
                          View Document
                        </a>
                      </div>
                    ) : (
                      <div className="p-10 bg-stone-50 rounded-2xl border border-dashed flex flex-col items-center text-stone-300">
                        <FileText size={40} className="mb-2" />
                        <p className="text-xs font-medium">No document uploaded</p>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t flex items-center justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedUser._id, false)}
                className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-500/5 font-bold rounded-xl transition-all disabled:opacity-50"
              >
                <X size={20} /> Mark Unverified
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedUser._id, true)}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : <><Check size={20} /> Mark Verified</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
