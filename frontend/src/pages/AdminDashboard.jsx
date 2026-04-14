import React, { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Camera,
  Check,
  Clock3,
  Eye,
  FileText,
  Heart,
  Mail,
  MapPin,
  Search,
  Shield,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAdminUsers, verifyAdminUser } from '../services/api';
import { getBackendBaseUrl } from '../utils/backendUrl';

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

const AdminDashboard = () => {
  const backendBaseUrl = getBackendBaseUrl();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('all'); // all | pending | verified

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAdminUsers();
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

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

  const stats = useMemo(() => {
    const total = users.length;
    const pending = users.filter((user) => !user.isVerified).length;
    const verified = users.filter((user) => user.isVerified).length;
    const withPhotos = users.filter((user) => Array.isArray(user.profileImages) && user.profileImages.length > 0).length;

    return { total, pending, verified, withPhotos };
  }, [users]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Header variant="authenticated" userName="Admin" />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-charcoal">Admin Control Center</h1>
            <p className="text-text-muted">Review all users, verify profiles, and inspect complete profile details.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <p className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Total Users</p>
            <p className="text-2xl font-bold text-text-charcoal mt-1 flex items-center gap-2"><Users size={20} />{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <p className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-1 flex items-center gap-2"><Clock3 size={20} />{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <p className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Verified</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-2"><BadgeCheck size={20} />{stats.verified}</p>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <p className="text-[11px] uppercase tracking-widest text-text-muted font-bold">With Photos</p>
            <p className="text-2xl font-bold text-text-charcoal mt-1 flex items-center gap-2"><Camera size={20} />{stats.withPhotos}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, city, profession"
              className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${view === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-text-charcoal border-stone-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setView('pending')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${view === 'pending' ? 'bg-primary text-white border-primary' : 'bg-white text-text-charcoal border-stone-200'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setView('verified')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${view === 'verified' ? 'bg-primary text-white border-primary' : 'bg-white text-text-charcoal border-stone-200'}`}
            >
              Verified
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border shadow-sm">
            <div className="mx-auto size-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 text-stone-300">
               <Check size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-charcoal mb-2">No users found</h3>
            <p className="text-text-muted">Try another filter or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="h-24 bg-gradient-to-r from-primary to-primary-light p-6">
                  <div className="flex justify-between items-start">
                    <div className="size-16 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0">
                      {user.profilePicture ? (
                        <img src={getImageUrl(user.profilePicture, backendBaseUrl)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                          <UserIcon size={32} />
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider ${user.isVerified ? 'bg-emerald-500/90 text-white' : 'bg-white/20 text-white'}`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 pt-10">
                  <h3 className="font-bold text-lg text-text-charcoal truncate">{user.fullname}</h3>
                  <p className="text-sm text-text-muted mb-6">{user.email}</p>
                  <p className="text-xs text-text-muted mb-1">{user.personalDetails?.city || 'City not set'}</p>
                  <p className="text-xs text-text-muted mb-4">{user.careerDetails?.profession || 'Profession not set'}</p>
                  
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-stone-50 hover:bg-stone-100 text-text-charcoal font-semibold rounded-xl border transition-all"
                  >
                    <Eye size={18} />
                    Review Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-charcoal">Review User: {selectedUser.fullname}</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Col: Info */}
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

                {/* Right Col: Media */}
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

            {/* Modal Footer */}
            <div className="p-6 bg-stone-50 border-t flex items-center justify-end gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => handleVerify(selectedUser._id, false)}
                className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-500/5 font-bold rounded-xl transition-all"
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
