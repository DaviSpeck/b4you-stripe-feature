export function resolveValidIPv4(ip) {
    if (!ip) return '127.0.0.1';

    // remove prefixo IPv6 do docker/node
    if (ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }

    // se ainda for IPv6 puro, força local
    if (ip.includes(':')) {
        return '127.0.0.1';
    }

    // se for IP interno de rede local (docker/mac)
    if (
        ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.')
    ) {
        return '127.0.0.1';
    }

    return ip;
}