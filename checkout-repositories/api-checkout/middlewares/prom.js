const client = require('prom-client');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const ipUtils = require('ip');
const pkg = require('../package.json');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const register = new client.Registry();
register.setDefaultLabels({
    service: pkg.name,
    version: pkg.version,
    environment: process.env.NODE_ENV ?? 'development',
});
client.collectDefaultMetrics({ register, timeout: 5_000 });

const COMMON = [
    'service', 'version', 'environment',
    'method', 'route', 'status_code', 'user_id',
    'device_type', 'os', 'os_version', 'browser', 'browser_version', 'cpu_arch',
    'country', 'region', 'city', 'accept_language',
    'origin_host', 'content_type',
];

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: COMMON,
    registers: [register],
});

const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP (s)',
    labelNames: COMMON,
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registers: [register],
});

const httpErrorsTotal = new client.Counter({
    name: 'http_errors_total',
    help: 'Total de respostas HTTP (>=400)',
    labelNames: COMMON,
    registers: [register],
});

const paymentIntentsCreatedTotal = new client.Counter({
    name: 'payment_intents_created_total',
    help: 'Total de PaymentIntents criados',
    labelNames: ['provider'],
    registers: [register],
});

const inFlightRequests = new client.Gauge({
    name: 'in_flight_requests',
    help: 'Requisições em processamento',
    labelNames: COMMON.filter(l => l !== 'status_code'),
    registers: [register],
});

const uaParser = new UAParser();
const geoCache = new Map();
const geoLookup = ip => {
    if (!ip || ipUtils.isPrivate(ip)) return {};
    if (geoCache.has(ip)) return geoCache.get(ip);
    const g = geoip.lookup(ip) || {};
    geoCache.set(ip, g);
    if (geoCache.size > 10_000) geoCache.delete(geoCache.keys().next().value);
    return g;
};

const SKIP_EXACT = new Set(['/metrics', '/healthcheck', '/favicon.ico']);
const SKIP_PREFIX = ['/._next/', '/.well-known/appspecific/'];

const normalizeRoute = (p = '/') => {
    if (p !== '/') p = p.replace(/\/+$/, '');
    return (
        p.split('/').map(seg => {
            if (!seg) return '';
            if (UUID.test(seg)) return ':uuid';
            if (/^\d+$/.test(seg)) return ':id';
            return seg;
        }).join('/') || '/'
    );
};

function metricsProm(req, res, next) {
    const url = req.originalUrl.split('?', 1)[0];
    if (SKIP_EXACT.has(url) || SKIP_PREFIX.some(pref => url.startsWith(pref))) {
        next();
        return;
    }

    const route = normalizeRoute(
        req.route?.path ? `${req.baseUrl}${req.route.path}` : url,
    );

    uaParser.setUA(req.headers['user-agent'] || '');
    const { type: device_type = 'desktop' } = uaParser.getDevice();
    const { name: browser = 'unknown',
        version: browser_version = 'unknown' } = uaParser.getBrowser();
    const { name: os = 'unknown',
        version: os_version = 'unknown' } = uaParser.getOS();
    const { arch: cpu_arch = 'unknown' } = uaParser.getCPU();

    const ipForward = (req.headers['x-forwarded-for'] ||
        req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] || '')
        .split(',')[0].trim();
    const ip = ipForward || req.socket.remoteAddress || 'unknown';
    const { country = (ipUtils.isPrivate(ip) ? 'private' : 'unknown'),
        region = 'unknown',
        city = 'unknown' } = geoLookup(ip);

    const userId =
        req.user?.id?.toString() ||
        req.user_id ||
        req.session?.user?.id?.toString() ||
        'anonymous';

    const labels = {
        service: pkg.name,
        version: pkg.version,
        environment: process.env.NODE_ENV ?? 'development',
        method: req.method,
        route,
        user_id: userId,
        device_type,
        os,
        os_version,
        browser,
        browser_version,
        cpu_arch,
        country,
        region,
        city,
        accept_language: req.headers['accept-language'] || 'unknown',
        origin_host: req.headers['x-forwarded-host'] || req.headers.host || 'unknown',
        content_type: req.headers['content-type'] || 'unknown',
    };

    inFlightRequests.labels(labels).inc();
    const stop = httpRequestDuration.startTimer(labels);

    res.on('finish', () => {
        inFlightRequests.labels(labels).dec();
        const all = { ...labels, status_code: res.statusCode };
        httpRequestsTotal.labels(all).inc();
        if (res.statusCode >= 400) httpErrorsTotal.labels(all).inc();
        stop({ status_code: res.statusCode });
    });

    next();

}

function setupMetricsEndpoint(app) {

    const allowedCidr = process.env.ALLOWED_CIDR;

    app.get('/metrics', async (req, res) => {
        if (allowedCidr) {
            const remoteIp = req.ip.replace(/^.*:/, '');
            const subnet = ipUtils.cidrSubnet(allowedCidr);

            if (!subnet.contains(remoteIp)) {
                res.status(403).send('Forbidden');
                return;
            }
        }

        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
        
    });
}

const incrementPaymentIntentsCreated = (provider) => {
    if (!provider) return;
    paymentIntentsCreatedTotal.labels({ provider }).inc();
};

module.exports = {
    metricsProm,
    setupMetricsEndpoint,
    incrementPaymentIntentsCreated,
    register,
};
