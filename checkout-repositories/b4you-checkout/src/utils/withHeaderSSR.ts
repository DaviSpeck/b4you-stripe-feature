import type { ParsedUrlQuery } from 'querystring';
import type {
    GetServerSideProps,
    GetServerSidePropsContext,
    GetServerSidePropsResult,
} from 'next';

import { headerContext, sanitize } from '@/utils/header-context';

export function withHeaderSSR<
    P extends object = Record<string, unknown>,
    Q extends ParsedUrlQuery = ParsedUrlQuery,
>(
    gssp: (
        ctx: GetServerSidePropsContext<Q>,
    ) => Promise<GetServerSidePropsResult<P>> | GetServerSidePropsResult<P>,
): GetServerSideProps<P, Q> {
    return async (ctx) => {
        if (!headerContext) {
            return gssp(ctx);
        }

        return headerContext.run(sanitize(ctx.req.headers), () => gssp(ctx));
    };
}