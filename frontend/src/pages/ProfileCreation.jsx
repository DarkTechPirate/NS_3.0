import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Header from '../components/Header';
import { uploadProfileImage } from '../services/api';
import { useAuth } from '../context/AuthContext';
const ProfileCreation = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('personal');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Overview
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    currentCity: '',
    relocate: false,
    aboutText: '',
    maritalStatus: 'never-married',
    religion: '',
    community: '',
    caste: '',
    motherTongue: '',
    jathagam: null,
    // Education & Career
    highestEducation: '',
    institution: '',
    fieldOfStudy: '',
    currentProfession: '',
    employer: '',
    annualIncome: '',
    workLocation: '',
    // Family Background
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    siblings: '',
    familyType: '',
    familyValues: '',
    familyLocation: '',
    // Values & Lifestyle
    dietPreference: '',
    drinkingHabit: '',
    smokingHabit: '',
    fitnessLevel: '',
    hobbies: [],
    livingArrangement: '',
    // Visual Portfolio
    photos: []
  });

  // Pre-fill form if user data exists
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        // Root Fields
        firstName: user.fullname ? user.fullname.split(' ')[0] : '',
        lastName: user.fullname ? user.fullname.split(' ').slice(1).join(' ') : '',
        gender: user.gender || '',

        // Personal
        dateOfBirth: user.personalDetails?.dob ? new Date(user.personalDetails.dob).toISOString().split('T')[0] : '',
        height: user.personalDetails?.height || '',
        maritalStatus: user.personalDetails?.maritalStatus || 'never-married',
        religion: user.personalDetails?.religion || '',
        community: user.personalDetails?.community || '',
        caste: user.personalDetails?.caste || '',
        motherTongue: user.personalDetails?.motherTongue || '',
        aboutText: user.personalDetails?.about || '',

        // Career
        highestEducation: user.careerDetails?.education || '',
        fieldOfStudy: user.careerDetails?.fieldOfStudy || '',
        institution: user.careerDetails?.institution || '',
        currentProfession: user.careerDetails?.profession || '',
        employer: user.careerDetails?.employer || '',
        annualIncome: user.careerDetails?.income || '',
        workLocation: user.careerDetails?.workLocation || '',

        // Family
        fatherName: user.familyDetails?.fatherName || '',
        fatherOccupation: user.familyDetails?.fatherOccupation || '',
        motherName: user.familyDetails?.motherName || '',
        motherOccupation: user.familyDetails?.motherOccupation || '',
        siblings: user.familyDetails?.siblings || '',
        familyType: user.familyDetails?.familyType || '',
        familyValues: user.familyDetails?.familyValues || '',
        familyLocation: user.familyDetails?.familyLocation || '',

        // Lifestyle
        dietPreference: user.lifestyleDetails?.diet || '',
        drinkingHabit: user.lifestyleDetails?.drinking || '',
        smokingHabit: user.lifestyleDetails?.smoking || '',
        hobbies: user.lifestyleDetails?.hobbies || [],
        livingArrangement: user.lifestyleDetails?.livingArrangement || '',

        // Preferences
        relocate: user.preferences?.relocate || false,

        // Photos
        photos: user.profileImages || (user.profilePicture ? [user.profilePicture] : []),
      }));
    }
  }, [user]);

  // Comprehensive Indian Religion, Community, and Caste Data
  const religions = [
    'Hindu',
    'Muslim',
    'Christian',
    'Sikh',
    'Buddhist',
    'Jain',
    'Parsi / Zoroastrian',
    'Jewish',
    'Bahai',
    'Spiritual - Not Religious',
    'Other'
  ];

  const communitiesByReligion = {
    'Hindu': [
      'Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Maratha', 'Rajput', 'Nair', 'Naidu',
      'Reddy', 'Kamma', 'Kapu', 'Gounder', 'Chettiar', 'Mudaliar', 'Thevar', 'Vanniyar',
      'Yadav', 'Kurmi', 'Jat', 'Gujjar', 'Patel', 'Agarwal', 'Baniya', 'Maheshwari',
      'Oswal', 'Khatri', 'Arora', 'Bhumihar', 'Tyagi', 'Saini', 'Ahir', 'Lingayat',
      'Vokkaliga', 'Ezhava', 'Nambiar', 'Menon', 'Pillai', 'SC/ST', 'OBC', 'Other'
    ],
    'Muslim': [
      'Sunni', 'Shia', 'Ahmadiyya', 'Bohra', 'Khoja', 'Memon', 'Pathan', 'Syed',
      'Sheikh', 'Mughal', 'Qureshi', 'Ansari', 'Malik', 'Khan', 'Mapilla', 'Labbai',
      'Rowther', 'Lebbai', 'Other'
    ],
    'Christian': [
      'Roman Catholic', 'Protestant', 'Syrian Christian', 'Marthoma', 'CSI', 'CNI',
      'Pentecostal', 'Baptist', 'Methodist', 'Anglican', 'Orthodox', 'Evangelical',
      'Born Again', 'Seventh Day Adventist', 'Jehovah Witness', 'Other'
    ],
    'Sikh': [
      'Jat Sikh', 'Khatri Sikh', 'Ramgarhia', 'Arora Sikh', 'Saini Sikh', 'Ravidasia',
      'Mazhabi', 'Other'
    ],
    'Buddhist': [
      'Mahayana', 'Theravada', 'Tibetan', 'Neo Buddhist', 'Other'
    ],
    'Jain': [
      'Digambar', 'Shwetambar', 'Agarwal', 'Oswal', 'Other'
    ],
    'Parsi / Zoroastrian': ['Parsi', 'Irani', 'Other'],
    'Jewish': ['Orthodox', 'Conservative', 'Reform', 'Other'],
    'Bahai': ['Bahai'],
    'Spiritual - Not Religious': ['Spiritual - Not Religious'],
    'Other': ['Other']
  };

  const castesByHinduCommunity = {
    'Brahmin': [
      'Iyer', 'Iyengar', 'Smartha', 'Madhwa', 'Namboodiri', 'Havyaka', 'Hoysala Karnataka',
      'Deshastha', 'Kokanastha', 'Chitpavan', 'Karhade', 'Saraswat', 'Goud Saraswat',
      'Kashmiri Pandit', 'Gaur', 'Maithili', 'Kanyakubj', 'Saryuparin', 'Bhumihar',
      'Tyagi', 'Mohyal', 'Pushkarna', 'Pareek', 'Daivadnya', 'Sthanika', 'Shivalli',
      'Anavil', 'Nagar', 'Audichya', 'Modh', 'Other'
    ],
    'Kshatriya': [
      'Rajput', 'Maratha', 'Nair', 'Thakur', 'Bhumihar', 'Jat', 'Khatri', 'Other'
    ],
    'Vaishya': [
      'Agarwal', 'Gupta', 'Baniya', 'Maheshwari', 'Oswal', 'Khandelwal', 'Porwal', 'Other'
    ],
    'Kayastha': [
      'Mathur', 'Saxena', 'Srivastava', 'Nigam', 'Bhatnagar', 'Kulshreshtha', 'Other'
    ]
  };

  const motherTongues = [
    'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada',
    'Malayalam', 'Odia', 'Punjabi', 'Assamese', 'Maithili', 'Sanskrit', 'Konkani',
    'Nepali', 'Sindhi', 'Dogri', 'Manipuri', 'Bodo', 'Kashmiri', 'Santhali', 'English', 'Other'
  ];

  const educationLevels = [
    'High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'M.Phil',
    'PhD / Doctorate', 'Post Doctoral', 'Professional Degree (CA, CS, CFA)',
    'Medical (MBBS, MD, MS)', 'Engineering (B.Tech, M.Tech)', 'Law (LLB, LLM)',
    'MBA / PGDM', 'Other'
  ];

  const incomeRanges = [
    'Below ₹5 Lakh', '₹5 - 10 Lakh', '₹10 - 15 Lakh', '₹15 - 25 Lakh',
    '₹25 - 50 Lakh', '₹50 - 75 Lakh', '₹75 Lakh - 1 Crore', 'Above ₹1 Crore',
    'Prefer not to say'
  ];

  const heightOptions = [];
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches <= 11; inches++) {
      const cm = Math.round((feet * 30.48) + (inches * 2.54));
      heightOptions.push(`${feet}' ${inches}" (${cm} cm)`);
    }
  }

  const sections = [
    { id: 'personal', label: 'Personal Overview', icon: 'person', status: 'in-progress' },
    { id: 'education', label: 'Education & Career', icon: 'school', status: 'required' },
    { id: 'family', label: 'Family Background', icon: 'diversity_3', status: 'required' },
    { id: 'values', label: 'Values & Lifestyle', icon: 'favorite', status: 'optional' },
    { id: 'portfolio', label: 'Visual Portfolio', icon: 'photo_library', status: 'pending' }
  ];

  const getProgress = () => {
    let filled = 0;
    let total = 10;
    if (formData.firstName) filled++;
    if (formData.lastName) filled++;
    if (formData.dateOfBirth) filled++;
    if (formData.gender) filled++;
    if (formData.religion) filled++;
    if (formData.community) filled++;
    if (formData.currentCity) filled++;
    if (formData.maritalStatus) filled++;
    if (formData.aboutText) filled++;
    if (formData.motherTongue) filled++;
    return Math.round((filled / total) * 100);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Reset dependent fields when religion changes
    if (field === 'religion') {
      setFormData({ ...formData, religion: value, community: '', caste: '' });
    }
    // Reset caste when community changes
    if (field === 'community') {
      setFormData({ ...formData, community: value, caste: '' });
    }
  };

  const renderPersonalOverview = () => (
    <div className="space-y-10">
      {/* Identity Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2 flex items-center gap-2">
          Identity
          <span className="text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">Required</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">First Name *</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="Enter your first name"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Last Name *</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="Enter your last name"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Date of Birth *</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Gender *</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Height</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              >
                <option value="">Select Height</option>
                {heightOptions.map((h) => <option key={h}>{h}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Religion & Community Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">
          Religion & Community
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Religion *</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.religion}
                onChange={(e) => handleInputChange('religion', e.target.value)}
              >
                <option value="">Select Religion</option>
                {religions.map((r) => <option key={r}>{r}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Community</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.community}
                onChange={(e) => handleInputChange('community', e.target.value)}
                disabled={!formData.religion}
              >
                <option value="">Select Community</option>
                {formData.religion && communitiesByReligion[formData.religion]?.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Caste / Sub-community</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.caste}
                onChange={(e) => handleInputChange('caste', e.target.value)}
                disabled={!formData.community || formData.religion !== 'Hindu'}
              >
                <option value="">Select Caste</option>
                {formData.community && formData.religion === 'Hindu' && castesByHinduCommunity[formData.community]?.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
            <p className="text-xs text-slate-grey/60 ml-2">Only applicable for Hindu community</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Mother Tongue *</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.motherTongue}
                onChange={(e) => handleInputChange('motherTongue', e.target.value)}
              >
                <option value="">Select Mother Tongue</option>
                {motherTongues.map((t) => <option key={t}>{t}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Location</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Current City *</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-grey/40 group-focus-within:text-rajkumari transition-colors">location_on</span>
              <input
                className="w-full bg-white border border-subtle-border rounded-full pl-12 pr-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
                placeholder="City, State"
                type="text"
                value={formData.currentCity}
                onChange={(e) => handleInputChange('currentCity', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-2">
            <input
              className="w-5 h-5 rounded border-subtle-border bg-white text-rajkumari focus:ring-rajkumari focus:ring-offset-ivory"
              id="relocate"
              type="checkbox"
              checked={formData.relocate}
              onChange={(e) => handleInputChange('relocate', e.target.checked)}
            />
            <label className="text-slate-grey text-sm cursor-pointer select-none" htmlFor="relocate">Open to relocation for the right match</label>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-subtle-border pb-2">
          <h3 className="text-charcoal text-xl font-serif font-medium">About You</h3>
          <span className="text-xs text-slate-grey/60 mb-1">Max 500 characters</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative">
            <textarea
              className="w-full bg-white border border-subtle-border rounded-2xl px-5 py-4 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all resize-none shadow-sm"
              placeholder="Write a brief introduction about who you are beyond your profession. What drives you? How do you spend your weekends?"
              rows="6"
              maxLength={500}
              value={formData.aboutText}
              onChange={(e) => handleInputChange('aboutText', e.target.value)}
            ></textarea>
            <div className="absolute bottom-4 right-4 text-xs text-slate-grey/40">{formData.aboutText.length}/500</div>
          </div>
        </div>
      </div>

      {/* Marital Status Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Marital Status *</h3>
        <div className="flex flex-wrap gap-3">
          {['never-married', 'divorced', 'widowed', 'annulled'].map((status) => (
            <label key={status} className="cursor-pointer">
              <input
                type="radio"
                name="marital_status"
                className="peer sr-only"
                checked={formData.maritalStatus === status}
                onChange={() => handleInputChange('maritalStatus', status)}
              />
              <div className="px-6 py-2 rounded-full border border-subtle-border bg-white text-slate-grey hover:bg-stone-50 peer-checked:bg-rajkumari peer-checked:text-white peer-checked:border-rajkumari peer-checked:font-medium transition-all shadow-sm capitalize">
                {status.replace('-', ' ')}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Jathagam (Horoscope) Upload Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-subtle-border pb-2">
          <h3 className="text-charcoal text-xl font-serif font-medium">Jathagam (Horoscope)</h3>
          <span className="text-xs text-slate-grey/60 mb-1">Image file (JPG, PNG, PDF)</span>
        </div>
        <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-rajkumari/40 hover:bg-rajkumari/5 transition-all cursor-pointer group">
          <input
            type="file"
            id="jathagam-upload"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => handleInputChange('jathagam', e.target.files[0])}
          />
          <label htmlFor="jathagam-upload" className="cursor-pointer">
            {formData.jathagam ? (
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
                <p className="text-sm font-medium text-charcoal">{formData.jathagam.name}</p>
                <p className="text-xs text-slate-grey">Click to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-stone-300 group-hover:text-rajkumari/60 transition-colors">upload_file</span>
                <p className="text-sm font-medium text-charcoal">Upload Jathagam</p>
                <p className="text-xs text-slate-grey">Click or drag & drop your horoscope image here</p>
              </div>
            )}
          </label>
        </div>
        <p className="text-xs text-slate-grey/60 ml-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">info</span>
          Jathagam is optional but valued by families who consider horoscope matching important.
        </p>
      </div>
    </div>
  );

  const renderEducationCareer = () => (
    <div className="space-y-10">
      {/* Education Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Highest Education</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.highestEducation}
                onChange={(e) => handleInputChange('highestEducation', e.target.value)}
              >
                <option value="">Select Education Level</option>
                {educationLevels.map((e) => <option key={e}>{e}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Field of Study</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="e.g., Computer Science, Medicine"
              type="text"
              value={formData.fieldOfStudy}
              onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-grey ml-2">Institution / University</label>
          <input
            className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
            placeholder="e.g., IIT Delhi, AIIMS, IIM Ahmedabad"
            type="text"
            value={formData.institution}
            onChange={(e) => handleInputChange('institution', e.target.value)}
          />
        </div>
      </div>

      {/* Career Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Career</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Current Profession</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="e.g., Software Engineer, Doctor"
              type="text"
              value={formData.currentProfession}
              onChange={(e) => handleInputChange('currentProfession', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Employer / Company</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="e.g., Google, Apollo Hospitals"
              type="text"
              value={formData.employer}
              onChange={(e) => handleInputChange('employer', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Annual Income</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.annualIncome}
                onChange={(e) => handleInputChange('annualIncome', e.target.value)}
              >
                <option value="">Select Income Range</option>
                {incomeRanges.map((i) => <option key={i}>{i}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Work Location</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="e.g., Bangalore, Remote"
              type="text"
              value={formData.workLocation}
              onChange={(e) => handleInputChange('workLocation', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFamilyBackground = () => (
    <div className="space-y-10">
      {/* Parents Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Parents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Father's Name</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="Enter father's name"
              type="text"
              value={formData.fatherName}
              onChange={(e) => handleInputChange('fatherName', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Father's Occupation</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="e.g., Retired IAS Officer, Business"
              type="text"
              value={formData.fatherOccupation}
              onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Mother's Name</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="Enter mother's name"
              type="text"
              value={formData.motherName}
              onChange={(e) => handleInputChange('motherName', e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Mother's Occupation</label>
            <input
              className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
              placeholder="e.g., Homemaker, Professor"
              type="text"
              value={formData.motherOccupation}
              onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Siblings & Family Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Family Details</h3>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-grey ml-2">Siblings</label>
          <input
            className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
            placeholder="e.g., 1 Elder Brother (Married), 1 Younger Sister"
            type="text"
            value={formData.siblings}
            onChange={(e) => handleInputChange('siblings', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Family Type</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.familyType}
                onChange={(e) => handleInputChange('familyType', e.target.value)}
              >
                <option value="">Select Family Type</option>
                <option>Nuclear Family</option>
                <option>Joint Family</option>
                <option>Extended Family</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Family Values</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.familyValues}
                onChange={(e) => handleInputChange('familyValues', e.target.value)}
              >
                <option value="">Select Family Values</option>
                <option>Traditional</option>
                <option>Moderate</option>
                <option>Liberal</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-grey ml-2">Family Location</label>
          <input
            className="w-full bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal placeholder-slate-grey/30 focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all shadow-sm"
            placeholder="e.g., Mumbai, Maharashtra"
            type="text"
            value={formData.familyLocation}
            onChange={(e) => handleInputChange('familyLocation', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderValuesLifestyle = () => (
    <div className="space-y-10">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">info</span>
          This section helps us match you with partners who share similar lifestyle preferences.
        </p>
      </div>

      {/* Diet & Habits Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Diet & Habits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Diet Preference</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.dietPreference}
                onChange={(e) => handleInputChange('dietPreference', e.target.value)}
              >
                <option value="">Select Diet</option>
                <option>Vegetarian</option>
                <option>Eggetarian</option>
                <option>Non-Vegetarian</option>
                <option>Vegan</option>
                <option>Jain</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Drinking</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.drinkingHabit}
                onChange={(e) => handleInputChange('drinkingHabit', e.target.value)}
              >
                <option value="">Select</option>
                <option>Non-Drinker</option>
                <option>Occasional</option>
                <option>Social Drinker</option>
                <option>Regular</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-grey ml-2">Smoking</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-subtle-border rounded-full px-5 py-3 text-charcoal focus:border-rajkumari focus:ring-1 focus:ring-rajkumari transition-all pr-10 shadow-sm cursor-pointer"
                value={formData.smokingHabit}
                onChange={(e) => handleInputChange('smokingHabit', e.target.value)}
              >
                <option value="">Select</option>
                <option>Non-Smoker</option>
                <option>Occasional</option>
                <option>Regular</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-grey/50 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>
      </div>

      {/* Living Arrangement Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Living Preferences</h3>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-grey ml-2">Preferred Living Arrangement After Marriage</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {['Nuclear Family', 'Joint Family', 'Open to Both', 'Depends on Circumstances'].map((arrangement) => (
              <label key={arrangement} className="cursor-pointer">
                <input
                  type="radio"
                  name="living_arrangement"
                  className="peer sr-only"
                  checked={formData.livingArrangement === arrangement}
                  onChange={() => handleInputChange('livingArrangement', arrangement)}
                />
                <div className="px-5 py-2 rounded-full border border-subtle-border bg-white text-slate-grey hover:bg-stone-50 peer-checked:bg-rajkumari peer-checked:text-white peer-checked:border-rajkumari peer-checked:font-medium transition-all shadow-sm">
                  {arrangement}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Hobbies Section */}
      <div className="space-y-6">
        <h3 className="text-charcoal text-xl font-serif font-medium border-b border-subtle-border pb-2">Interests & Hobbies</h3>
        <div className="flex flex-wrap gap-2">
          {['Reading', 'Travel', 'Music', 'Movies', 'Sports', 'Cooking', 'Photography', 'Art', 'Yoga', 'Fitness', 'Gaming', 'Hiking', 'Dancing', 'Writing'].map((hobby) => (
            <label key={hobby} className="cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={formData.hobbies.includes(hobby)}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleInputChange('hobbies', [...formData.hobbies, hobby]);
                  } else {
                    handleInputChange('hobbies', formData.hobbies.filter(h => h !== hobby));
                  }
                }}
              />
              <div className="px-4 py-2 rounded-full border border-subtle-border bg-white text-slate-grey hover:bg-stone-50 peer-checked:bg-primary/10 peer-checked:text-primary peer-checked:border-primary/30 transition-all shadow-sm">
                {hobby}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadProfileImage(file);
      // Backend returns { message, filePath }
      if (res.filePath) {
        const fullPath = `http://localhost:5000/uploads/${res.filePath}`;
        // Update local photos list
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, fullPath]
        }));
        // Update global user context for Header
        if (user) {
          setUser({ ...user, profilePicture: res.filePath });
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const renderVisualPortfolio = () => (
    <div className="space-y-10">
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center">
        <span className="material-symbols-outlined text-5xl text-stone-300 mb-4">add_photo_alternate</span>
        <h3 className="text-lg font-serif font-medium text-charcoal mb-2">Upload Your Photos</h3>
        <p className="text-sm text-slate-grey mb-6 max-w-md mx-auto">
          Add 3-6 photos that showcase your personality. Clear face photos work best for making a great first impression.
        </p>
        <input
          type="file"
          id="profile-upload"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        <label
          htmlFor="profile-upload"
          className={`bg-rajkumari text-white hover:bg-rajkumari/90 px-6 py-3 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <span className="material-symbols-outlined text-lg">upload</span>
          )}
          {uploading ? 'Uploading...' : 'Choose Photos'}
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {formData.photos.map((photo, index) => (
          <div key={index} className="aspect-square rounded-xl border border-stone-200 bg-stone-50 overflow-hidden relative group">
            <img src={photo} alt={`Profile ${index}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
        {/* Placeholders for remaining slots */}
        {[...Array(Math.max(0, 6 - formData.photos.length))].map((_, i) => (
          <label
            key={`placeholder-${i}`}
            htmlFor="profile-upload"
            className="aspect-square rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 flex items-center justify-center hover:border-rajkumari/50 hover:bg-rajkumari/5 transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-3xl text-stone-300 group-hover:text-rajkumari/50">add</span>
          </label>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">tips_and_updates</span>
          Photo Guidelines
        </h4>
        <ul className="text-sm text-blue-600 space-y-1 ml-6">
          <li>• Use recent photos (within last 6 months)</li>
          <li>• Include at least one clear face photo</li>
          <li>• Avoid group photos as your main picture</li>
          <li>• Natural lighting works best</li>
        </ul>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal': return renderPersonalOverview();
      case 'education': return renderEducationCareer();
      case 'family': return renderFamilyBackground();
      case 'values': return renderValuesLifestyle();
      case 'portfolio': return renderVisualPortfolio();
      default: return renderPersonalOverview();
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'personal': return { step: 'Step 1 of 5', title: "Let's start with the basics.", subtitle: "Share your story with clarity and intent. We curate matches based on deep compatibility, so authenticity here is your greatest asset." };
      case 'education': return { step: 'Step 2 of 5', title: "Your education & career.", subtitle: "Help us understand your professional journey. This information is valued by families during the match review." };
      case 'family': return { step: 'Step 3 of 5', title: "Tell us about your family.", subtitle: "Family plays an important role in Indian marriages. Share details that help families connect." };
      case 'values': return { step: 'Step 4 of 5 (Optional)', title: "Your values & lifestyle.", subtitle: "What matters most to you? Help us find someone who shares your outlook on life." };
      case 'portfolio': return { step: 'Step 5 of 5', title: "Show who you are.", subtitle: "A picture is worth a thousand words. Add photos that capture your personality." };
      default: return { step: 'Step 1 of 5', title: "Let's start with the basics.", subtitle: "" };
    }
  };

  // Transform flat formData to nested backend schema
  const getPayload = () => {
    return {
      gender: formData.gender,
      personalDetails: {
        dob: formData.dateOfBirth,
        height: formData.height,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        community: formData.community,
        caste: formData.caste,
        motherTongue: formData.motherTongue,
        about: formData.aboutText,
        // jathagam is handled separately via upload currently, or needs logic
      },
      careerDetails: {
        education: formData.highestEducation,
        fieldOfStudy: formData.fieldOfStudy,
        institution: formData.institution,
        profession: formData.currentProfession,
        employer: formData.employer,
        income: formData.annualIncome,
        workLocation: formData.workLocation,
      },
      familyDetails: {
        fatherName: formData.fatherName,
        fatherOccupation: formData.fatherOccupation,
        motherName: formData.motherName,
        motherOccupation: formData.motherOccupation,
        siblings: formData.siblings,
        familyType: formData.familyType,
        familyValues: formData.familyValues,
        familyLocation: formData.familyLocation,
      },
      lifestyleDetails: {
        diet: formData.dietPreference,
        drinking: formData.drinkingHabit,
        smoking: formData.smokingHabit,
        hobbies: formData.hobbies,
        livingArrangement: formData.livingArrangement,
      },
      preferences: {
        relocate: formData.relocate,
      },
      profileImages: formData.photos, // Array of URLs
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
    };
  };

  const handleSave = async (isDraft = false) => {
    try {
      setUploading(true);
      const payload = getPayload();
      const res = await import('../services/api').then(mod => mod.updateProfileInfo(payload)); // dynamic import to avoid circular dep if any, or just import at top

      if (res.success) {
        if (!isDraft) {
          const currentIndex = sections.findIndex(s => s.id === activeSection);
          if (currentIndex < sections.length - 1) {
            setActiveSection(sections[currentIndex + 1].id);
          } else {
            // Final submit
            navigate('/profile');
          }
        } else {
          navigate('/profile');
        }
      } else {
        alert("Failed to save: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-ivory text-charcoal font-sans overflow-hidden h-screen flex flex-col antialiased">
      {/* Header */}
      <Header />

      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-subtle-border bg-stone-paper hidden lg:flex flex-col h-full overflow-y-auto p-8 relative">
          <div className="flex flex-col gap-8">
            {/* Progress Card */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-subtle-border shadow-soft">
              <div className="flex gap-6 justify-between items-center">
                <p className="text-charcoal text-base font-serif font-medium">Profile Status</p>
                <p className="text-rajkumari text-sm font-bold">{getProgress()}%</p>
              </div>
              <div className="rounded-full bg-ivory border border-subtle-border h-2 overflow-hidden">
                <div className="h-full rounded-full bg-rajkumari shadow-glow transition-all" style={{ width: `${getProgress()}%` }}></div>
              </div>
              <p className="text-slate-grey/80 text-xs">Authenticity attracts the right match.</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <div className="text-xs font-bold tracking-widest text-slate-grey/50 uppercase mb-2 pl-3">Sections</div>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all group text-left w-full ${activeSection === section.id
                    ? 'bg-white border border-rajkumari/20 shadow-soft'
                    : 'hover:bg-white/60 opacity-70 hover:opacity-100'
                    }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeSection === section.id ? 'text-rajkumari' : 'text-slate-grey group-hover:text-rajkumari'
                    }`}>{section.icon}</span>
                  <div className="flex flex-col">
                    <span className={`text-sm ${activeSection === section.id ? 'font-semibold text-charcoal' : 'font-medium text-slate-grey group-hover:text-charcoal'
                      }`}>{section.label}</span>
                    {section.id === 'personal' && activeSection === 'personal' && (
                      <span className="text-ghee text-[10px] font-bold uppercase tracking-wide">In Progress</span>
                    )}
                    {section.id === 'values' && (
                      <span className="text-stone-400 text-[10px] font-medium uppercase tracking-wide">Optional</span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto pt-8 flex items-center gap-3 opacity-70">
            <span className="material-symbols-outlined text-ghee text-[20px]">lock</span>
            <p className="text-xs text-slate-grey font-medium">Your data is encrypted and visible only to verified matches.</p>
          </div>
        </aside>

        {/* Main Form */}
        <main className="flex-1 overflow-y-auto bg-ivory relative scroll-smooth">
          <div className="max-w-[800px] mx-auto px-6 py-10 pb-32">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ghee/10 text-[#B48512] text-xs font-bold uppercase tracking-wider mb-4 border border-ghee/30">
                {getSectionTitle().step}
              </div>
              <h1 className="text-charcoal text-4xl lg:text-5xl font-serif font-medium leading-tight tracking-tight mb-4">
                {getSectionTitle().title.split(' ').map((word, i, arr) =>
                  i === arr.length - 1 ? (
                    <span key={i} className="relative inline-block z-10">{word}<span className="absolute bottom-1 left-0 w-full h-3 bg-ghee/30 -z-10 rounded-full"></span></span>
                  ) : word + ' '
                )}
              </h1>
              <p className="text-slate-grey text-lg font-light leading-relaxed max-w-2xl">
                {getSectionTitle().subtitle}
              </p>
            </div>

            <form className="flex flex-col gap-10" onSubmit={(e) => e.preventDefault()}>
              {renderActiveSection()}
            </form>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="fixed bottom-0 left-0 lg:left-80 right-0 bg-ivory/90 backdrop-blur-md border-t border-subtle-border p-6 flex justify-between items-center z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            <button
              onClick={() => handleSave(true)}
              className="text-slate-grey hover:text-charcoal text-sm font-medium px-4 py-2 rounded-full hover:bg-stone-100 transition-colors"
            >
              Save Draft
            </button>
            <div className="flex items-center gap-3">
              {activeSection !== 'personal' && (
                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex > 0) setActiveSection(sections[currentIndex - 1].id);
                  }}
                  className="text-slate-grey hover:text-charcoal text-sm font-medium px-4 py-2 rounded-full hover:bg-stone-100 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Previous
                </button>
              )}
              <button
                onClick={() => handleSave(false)}
                disabled={uploading}
                className="bg-rajkumari text-white hover:bg-[#B01E50] px-8 py-3 rounded-full text-sm font-bold tracking-wide transition-all transform hover:scale-105 shadow-[0_4px_14px_rgba(209,46,104,0.4)] flex items-center gap-2 disabled:opacity-70"
              >
                {activeSection === 'portfolio' ? 'Submit Profile' : 'Continue'}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileCreation;
