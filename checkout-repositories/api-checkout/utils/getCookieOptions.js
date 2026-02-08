const { getRequestDomain } = require('./getRequestDomain');

function normalizeHost(domain) {
    if (!domain) return null;

    try {
        if (domain.startsWith('http')) {
            return new URL(domain).hostname;
        }
        return domain.replace(/^https?:\/\//, '');
    } catch {
        return domain;
    }
}

function getCookieDomain(host) {
    if (!host) return undefined;

    if (host.endsWith('.b4you.com.br')) {
        return '.b4you.com.br';
    }

    if (host.endsWith('.b4you-sandbox.com.br')) {
        return '.b4you-sandbox.com.br';
    }

    // checkout transparente → NÃO definir domain
    return undefined;
}

function getCookieOptions(req) {
    const requestDomain = getRequestDomain(req);
    const host = normalizeHost(requestDomain);

    const domain = getCookieDomain(host);

    if (domain) {
        return {
            sameSite: 'lax',
            secure: true,
            domain,
        };
    }

    // Checkout transparente (cross-site)
    return {
        sameSite: 'none',
        secure: true,
        // domain propositalmente ausente
    };
}

module.exports = {
    getCookieOptions,
};