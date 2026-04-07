const hasValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

const getRequiredValuesFromUser = (user) => {
    if (!user) return [];

    const personal = user.personalDetails || {};
    const career = user.careerDetails || {};
    const family = user.familyDetails || {};
    const images = Array.isArray(user.profileImages) && user.profileImages.length > 0
        ? user.profileImages
        : (user.profilePicture ? [user.profilePicture] : []);

    return [
        user.fullname,
        user.gender,
        personal.dob,
        personal.religion,
        personal.motherTongue,
        personal.city,
        personal.about,
        career.education,
        career.profession,
        family.fatherName,
        family.motherName,
        family.familyType,
        images,
    ];
};

const getRequiredValuesFromForm = (formData) => {
    if (!formData) return [];

    return [
        `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
        formData.gender,
        formData.dateOfBirth,
        formData.religion,
        formData.motherTongue,
        formData.currentCity,
        formData.aboutText,
        formData.highestEducation,
        formData.currentProfession,
        formData.fatherName,
        formData.motherName,
        formData.familyType,
        formData.photos,
    ];
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
