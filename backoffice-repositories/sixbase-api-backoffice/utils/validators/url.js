function validateUrl(link) {
    try {
        const url = new URL(link);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

module.exports = { validateUrl };