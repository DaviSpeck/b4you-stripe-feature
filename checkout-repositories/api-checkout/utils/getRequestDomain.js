function getRequestDomain(req) {
    const {origin} = req.headers;
    if (origin) return origin;

    const {referer} = req.headers;
    if (referer) {
        try {
            return new URL(referer).origin;
        } catch {
            return referer;
        }
    }

    const xForwardedHost = req.headers['x-forwarded-host'];
    if (xForwardedHost) return xForwardedHost;

    const {host} = req.headers;
    if (host) return host;

    return "unknown";
}

module.exports = {
    getRequestDomain
};