const hasValue = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

export const isProfileComplete = (user) => {
    if (!user) return false;

    const personal = user.personalDetails || {};
    const career = user.careerDetails || {};
    const family = user.familyDetails || {};
    const images = Array.isArray(user.profileImages) && user.profileImages.length > 0
        ? user.profileImages
        : (user.profilePicture ? [user.profilePicture] : []);

    const requiredValues = [
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
    ];

    return requiredValues.every(hasValue) && hasValue(images);
};
