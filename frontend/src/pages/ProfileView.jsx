import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const ProfileView = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
    }

    const {
        fullname,
        gender,
        personalDetails,
        careerDetails,
        familyDetails,
        lifestyleDetails,
        profileImages
    } = user;

    const sections = [
        {
            title: "Basic Info",
            data: [
                { label: "Date of Birth", value: personalDetails?.dob ? new Date(personalDetails.dob).toLocaleDateString() : 'Not Set' },
                { label: "Gender", value: gender || 'Not Set' },
                { label: "Height", value: personalDetails?.height || 'Not Set' },
                { label: "Marital Status", value: personalDetails?.maritalStatus?.replace('-', ' ') || 'Not Set' },
                { label: "Religion", value: personalDetails?.religion || 'Not Set' },
                { label: "Community", value: personalDetails?.community || 'Not Set' },
                { label: "Mother Tongue", value: personalDetails?.motherTongue || 'Not Set' },
                { label: "City", value: user.addresses?.[0]?.city || 'Not Set' }, // Assuming address structure or just use what we have in form
            ]
        },
        {
            title: "Career & Education",
            data: [
                { label: "Education", value: careerDetails?.education || 'Not Set' },
                { label: "Profession", value: careerDetails?.profession || 'Not Set' },
                { label: "Employer", value: careerDetails?.employer || 'Not Set' },
                { label: "Income", value: careerDetails?.income || 'Not Set' },
            ]
        },
        {
            title: "Family",
            data: [
                { label: "Father", value: `${familyDetails?.fatherName || ''} (${familyDetails?.fatherOccupation || ''})` },
                { label: "Mother", value: `${familyDetails?.motherName || ''} (${familyDetails?.motherOccupation || ''})` },
                { label: "Siblings", value: familyDetails?.siblings || 'Not Set' },
                { label: "Type", value: familyDetails?.familyType || 'Not Set' },
            ]
        },
        {
            title: "Lifestyle",
            data: [
                { label: "Diet", value: lifestyleDetails?.diet || 'Not Set' },
                { label: "Drinking", value: lifestyleDetails?.drinking || 'Not Set' },
                { label: "Smoking", value: lifestyleDetails?.smoking || 'Not Set' },
                { label: "Hobbies", value: lifestyleDetails?.hobbies?.join(', ') || 'None' },
            ]
        }
    ];

    return (
        <div className="bg-background-ivory min-h-screen text-text-charcoal font-display">
            <Header />
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-3xl shadow-sm border border-subtle-border overflow-hidden">
                    {/* Cover / Header Area */}
                    <div className="h-48 bg-gradient-to-r from-rajkumari-light to-ghee-light relative">
                        {/* Edit Button */}
                        <Link
                            to="/create-profile"
                            className="absolute top-6 right-6 bg-white/80 backdrop-blur-md hover:bg-white text-rajkumari px-5 py-2 rounded-full text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                            Edit Profile
                        </Link>
                    </div>

                    <div className="px-8 pb-12">
                        {/* Profile Image & Name */}
                        <div className="relative -mt-20 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            <div className="w-40 h-40 rounded-full border-4 border-white shadow-md overflow-hidden bg-stone-100">
                                {profileImages && profileImages.length > 0 ? (
                                    <img
                                        src={profileImages[0].startsWith('http') ? profileImages[0] : `http://localhost:5000/uploads/${profileImages[0]}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">
                                        <span className="material-symbols-outlined text-6xl">person</span>
                                    </div>
                                )}
                            </div>
                            <div className="mb-4">
                                <h1 className="text-3xl font-serif font-bold text-charcoal">{fullname}</h1>
                                <p className="text-slate-grey">{personalDetails?.about || "No bio added yet."}</p>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {sections.map((section, idx) => (
                                <section key={idx}>
                                    <h3 className="text-xl font-serif font-medium text-charcoal mb-4 border-b border-subtle-border pb-2">
                                        {section.title}
                                    </h3>
                                    <div className="space-y-3">
                                        {section.data.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-grey font-medium">{item.label}</span>
                                                <span className="text-charcoal font-semibold text-right max-w-[60%]">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* Photos Gallery */}
                        {profileImages && profileImages.length > 0 && (
                            <div className="mt-12">
                                <h3 className="text-xl font-serif font-medium text-charcoal mb-6 border-b border-subtle-border pb-2">
                                    Photos
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {profileImages.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm border border-stone-100">
                                            <img
                                                src={img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`}
                                                alt={`Gallery ${idx}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfileView;
