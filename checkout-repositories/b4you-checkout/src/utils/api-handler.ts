import * as Sentry from '@sentry/nextjs';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { headerContext } from '@/utils/header-context';
import { runWithHeaders } from '@/services/axios';

export function apiHandler<T>(
    handler: NextApiHandler<T | { message: string }>,
): NextApiHandler<T | { message: string }> {
    return async (req: NextApiRequest, res: NextApiResponse<T | { message: string }>) => {
        const run = () => handler(req, res);

        try {
            if (headerContext) {
                return await runWithHeaders(req, run);
            }

            return await run();
        } catch (err) {
            Sentry.captureException(err);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}
