import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Check, X, Eye, User as UserIcon, Briefcase, Heart, Camera, FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/pending`, { withCredentials: true });
      setPendingUsers(res.data.data);
    } catch (error) {
      console.error("Failed to fetch pending users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, status) => {
    try {
      setActionLoading(true);
      await axios.patch(`${API_URL}/admin/users/${userId}/verify`, { isVerified: status }, { withCredentials: true });
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      setSelectedUser(null);
    } catch (error) {
      console.error("Verification failed", error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header variant="authenticated" userName="Admin" />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-charcoal">Admin Moderation</h1>
            <p className="text-text-muted">Review and verify user profiles to ensure platform quality.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border shadow-sm">
            <div className="mx-auto size-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 text-stone-300">
               <Check size={40} />
            </div>
            <h3 className="text-xl font-bold text-text-charcoal mb-2">Queue Clear!</h3>
            <p className="text-text-muted">No pending users awaiting verification at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingUsers.map(user => (
              <div key={user._id} className="bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="h-24 bg-gradient-to-r from-primary to-primary-light p-6">
                  <div className="flex justify-between items-start">
                    <div className="size-16 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-50">
                          <UserIcon size={32} />
                        </div>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-bold uppercase tracking-wider">
                      Pending
                    </span>
                  </div>
                </div>
                
                <div className="p-6 pt-10">
                  <h3 className="font-bold text-lg text-text-charcoal truncate">{user.fullname}</h3>
                  <p className="text-sm text-text-muted mb-6">{user.email}</p>
                  
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
                          <img src={img} className="w-full h-full object-cover" alt="" />
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
                          href={selectedUser.personalDetails.jathagam} 
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
                <X size={20} /> Reject
              </button>
              <button 
                disabled={actionLoading}
                onClick={() => handleVerify(selectedUser._id, true)}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : <><Check size={20} /> Approve User</>}
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
