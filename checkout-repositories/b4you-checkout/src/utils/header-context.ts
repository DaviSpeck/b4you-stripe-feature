/* eslint-disable @typescript-eslint/no-require-imports */
import type { AsyncLocalStorage as NodeALS } from 'async_hooks';
import type { IncomingHttpHeaders } from 'http';

export type HeaderBag = Record<string, string>;

let headerContext: NodeALS<HeaderBag> | null = null;

if (typeof window === 'undefined') {
    const { AsyncLocalStorage } =
        require('async_hooks') as typeof import('async_hooks');
    headerContext = new AsyncLocalStorage<HeaderBag>();
}

export { headerContext };

export function sanitize(h: IncomingHttpHeaders): HeaderBag {
    const out: HeaderBag = {};

    Object.entries(h).forEach(([k, v]) => {
        if (!v) return;
        out[k.toLowerCase()] = Array.isArray(v) ? v.join(',') : v;
    });

    delete out.host;
    delete out.connection;
    delete out['content-length'];
    delete out['transfer-encoding'];
    delete out.expect;

    out['x-forwarded-for'] ??= out['cf-connecting-ip'] ?? out['x-real-ip'] ?? '';

    return out;
}