const hasValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

const getUserImages = (user) => {
    if (!user) return [];

    return Array.isArray(user.profileImages) && user.profileImages.length > 0
        ? user.profileImages
        : (user.profilePicture ? [user.profilePicture] : []);
};

const REQUIRED_FIELD_DEFINITIONS = [
    {
        label: 'Full Name',
        section: 'personal',
        getUserValue: (user) => user?.fullname,
        getFormValue: (formData) => `${formData?.firstName || ''} ${formData?.lastName || ''}`.trim(),
    },
    {
        label: 'Gender',
        section: 'personal',
        getUserValue: (user) => user?.gender,
        getFormValue: (formData) => formData?.gender,
    },
    {
        label: 'Date of Birth',
        section: 'personal',
        getUserValue: (user) => user?.personalDetails?.dob,
        getFormValue: (formData) => formData?.dateOfBirth,
    },
    {
        label: 'Religion',
        section: 'personal',
        getUserValue: (user) => user?.personalDetails?.religion,
        getFormValue: (formData) => formData?.religion,
    },
    {
        label: 'Mother Tongue',
        section: 'personal',
        getUserValue: (user) => user?.personalDetails?.motherTongue,
        getFormValue: (formData) => formData?.motherTongue,
    },
    {
        label: 'Current City',
        section: 'personal',
        getUserValue: (user) => user?.personalDetails?.city,
        getFormValue: (formData) => formData?.currentCity,
    },
    {
        label: 'About You',
        section: 'personal',
        getUserValue: (user) => user?.personalDetails?.about,
        getFormValue: (formData) => formData?.aboutText,
    },
    {
        label: 'Highest Education',
        section: 'education',
        getUserValue: (user) => user?.careerDetails?.education,
        getFormValue: (formData) => formData?.highestEducation,
    },
    {
        label: 'Current Profession',
        section: 'education',
        getUserValue: (user) => user?.careerDetails?.profession,
        getFormValue: (formData) => formData?.currentProfession,
    },
    {
        label: "Father's Name",
        section: 'family',
        getUserValue: (user) => user?.familyDetails?.fatherName,
        getFormValue: (formData) => formData?.fatherName,
    },
    {
        label: "Mother's Name",
        section: 'family',
        getUserValue: (user) => user?.familyDetails?.motherName,
        getFormValue: (formData) => formData?.motherName,
    },
    {
        label: 'Family Type',
        section: 'family',
        getUserValue: (user) => user?.familyDetails?.familyType,
        getFormValue: (formData) => formData?.familyType,
    },
    {
        label: 'Diet Preference',
        section: 'values',
        getUserValue: (user) => user?.lifestyleDetails?.diet,
        getFormValue: (formData) => formData?.dietPreference,
    },
    {
        label: 'Drinking Habit',
        section: 'values',
        getUserValue: (user) => user?.lifestyleDetails?.drinking,
        getFormValue: (formData) => formData?.drinkingHabit,
    },
    {
        label: 'Smoking Habit',
        section: 'values',
        getUserValue: (user) => user?.lifestyleDetails?.smoking,
        getFormValue: (formData) => formData?.smokingHabit,
    },
    {
        label: 'Living Arrangement Preference',
        section: 'values',
        getUserValue: (user) => user?.lifestyleDetails?.livingArrangement,
        getFormValue: (formData) => formData?.livingArrangement,
    },
    {
        label: 'Profile Photos',
        section: 'portfolio',
        getUserValue: (user) => getUserImages(user),
        getFormValue: (formData) => formData?.photos,
    },
];

const getMissingRequiredFields = (sourceType, source, section) => {
    if (!source) return REQUIRED_FIELD_DEFINITIONS.map((field) => field.label);

    return REQUIRED_FIELD_DEFINITIONS
        .filter((field) => !section || field.section === section)
        .filter((field) => {
            const value =
                sourceType === 'user'
                    ? field.getUserValue(source)
                    : field.getFormValue(source);
            return !hasValue(value);
        })
        .map((field) => field.label);
};

const getRequiredValuesFromUser = (user) => {
    if (!user) return [];

    return REQUIRED_FIELD_DEFINITIONS.map((field) => field.getUserValue(user));
};

const getRequiredValuesFromForm = (formData) => {
    if (!formData) return [];

    return REQUIRED_FIELD_DEFINITIONS.map((field) => field.getFormValue(formData));
};

const getCompletionPercentage = (values) => {
    if (!values.length) return 0;

    const filled = values.filter(hasValue).length;
    return Math.round((filled / values.length) * 100);
};

export const isProfileComplete = (user) => {
    const requiredValues = getRequiredValuesFromUser(user);
    return requiredValues.length > 0 && requiredValues.every(hasValue);
};

export const getProfileCompletionFromForm = (formData) => {
    const requiredValues = getRequiredValuesFromForm(formData);
    return getCompletionPercentage(requiredValues);
};

export const getProfileCompletionFromUser = (user) => {
    const requiredValues = getRequiredValuesFromUser(user);
    return getCompletionPercentage(requiredValues);
};

export const getMissingProfileFieldsFromUser = (user, section) => {
    return getMissingRequiredFields('user', user, section);
};

export const getMissingProfileFieldsFromForm = (formData, section) => {
    return getMissingRequiredFields('form', formData, section);
};

export const getFirstMissingProfileSectionFromUser = (user) => {
    const firstMissing = REQUIRED_FIELD_DEFINITIONS.find(
        (field) => !hasValue(field.getUserValue(user))
    );
    return firstMissing?.section || null;
};

export const getFirstMissingProfileSectionFromForm = (formData) => {
    const firstMissing = REQUIRED_FIELD_DEFINITIONS.find(
        (field) => !hasValue(field.getFormValue(formData))
    );
    return firstMissing?.section || null;
};
