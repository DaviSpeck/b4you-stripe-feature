import { Redirect } from 'react-router-dom';
import { isUserLoggedIn } from '@utils';

/**
 * @description Controla ACL e redirecionamento baseado em autenticação e permissão.
 */
const FinalRoute = ({ route, ability, ...props }) => {
    const { meta = {}, component: Component } = route;
    const { action = 'read', resource, authRoute, publicRoute } = meta;

    if (!isUserLoggedIn() && !publicRoute && !authRoute) {
        return <Redirect to="/login" />;
    }

    if (authRoute && isUserLoggedIn()) {
        return <Redirect to="/" />;
    }

    if (isUserLoggedIn() && ability && !ability.can(action, resource)) {
        return <Redirect to="/misc/not-authorized" />;
    }

    return <Component {...props} />;
};

export default FinalRoute;