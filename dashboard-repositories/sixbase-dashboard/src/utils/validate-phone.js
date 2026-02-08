export const validatePhone = (value) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, '');

    return digits.length === 11 && digits[2] === '9';
};