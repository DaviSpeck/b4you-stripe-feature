const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');

function parseDotEnvLike(input) {
    const out = {};
    for (const line of input.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i <= 0) continue;
        out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
    }
    return out;
}

function getSecretRawUtf8(res) {
    if (res.SecretString) return res.SecretString;
    const bin = res.SecretBinary;
    if (!bin) return undefined;
    if (typeof bin === 'string') return Buffer.from(bin, 'base64').toString('utf8');
    if (Buffer.isBuffer(bin)) return bin.toString('utf8');
    if (bin instanceof Uint8Array) return Buffer.from(bin).toString('utf8');
    return Buffer.from(bin).toString('utf8');
}

async function bootstrapEnv(opts = {}) {
    const DEBUG = process.env.ENV_LOADER_DEBUG === 'true';

    const root = process.cwd();
    for (const file of ['.env', '.env.local']) {
        const p = path.join(root, file);
        if (fs.existsSync(p)) dotenv.config({ path: p });
    }

    const secretNames = (opts.secretNames ?? process.env.AWS_SECRETS_MANAGER ?? '').trim();
    const region =
        opts.region ??
        process.env.AWS_REGION ??
        process.env.AWS_DEFAULT_REGION ??
        '';

    const forceOverride = (opts.forceOverride ?? (process.env.SECRETS_FORCE_OVERRIDE === 'true')) || false;
    const skipIfMissing = (opts.skipIfMissing ?? (process.env.SECRETS_SKIP_IF_MISSING === 'true')) || false;
    const pickPrefix = opts.pickPrefix ?? process.env.SECRETS_PICK_PREFIX;
    const requiredKeys = Array.isArray(opts.requiredKeys) ? opts.requiredKeys : [];

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID_LOCAL;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_LOCAL;
    const sessionToken = process.env.AWS_SESSION_TOKEN;
    const credentials =
        accessKeyId && secretAccessKey
            ? new AWS.Credentials({ accessKeyId, secretAccessKey, sessionToken })
            : undefined;

    AWS.config.update({ region: region || undefined, credentials, httpOptions: { family: 4 } });

    if (!secretNames) {
        if (DEBUG) console.warn('[env.loader] AWS_SECRETS_MANAGER vazio — nada a carregar');
    } else {
        const sm = new AWS.SecretsManager();
        const names = secretNames.split(',').map(s => s.trim()).filter(Boolean);

        for (const name of names) {
            try {
                const res = await sm.getSecretValue({ SecretId: name }).promise();
                const raw = getSecretRawUtf8(res);
                if (!raw) throw new Error('Secret vazio');

                let kv;
                try {
                    kv = JSON.parse(raw);
                } catch (_) {
                    kv = parseDotEnvLike(raw);
                }

                const wrapperKey = ['ENV_VARS', 'ENV_SECRETS'].find(k => Object.prototype.hasOwnProperty.call(kv, k));
                if (!wrapperKey) throw new Error('Wrapper ENV_VARS/ENV_SECRETS não encontrado.');

                const inner = kv[wrapperKey];
                let envs;
                if (typeof inner === 'string') {
                    try {
                        envs = JSON.parse(inner);
                    } catch {
                        throw new Error(`${wrapperKey} não é um JSON válido`);
                    }
                } else if (inner && typeof inner === 'object') {
                    envs = inner;
                } else {
                    throw new Error(`${wrapperKey} não é string JSON nem objeto`);
                }

                for (const [k, v] of Object.entries(envs)) {
                    if (pickPrefix && !k.startsWith(pickPrefix)) continue;
                    if (!forceOverride && process.env[k] !== undefined) continue;
                    process.env[k] = String(v);
                }

                if (DEBUG) console.log(`[env.loader] loaded ${wrapperKey} from "${name}" with ${Object.keys(envs).length} keys`);
            } catch (err) {
                const code = err && (err.code || err.name);
                if (skipIfMissing && (code === 'ResourceNotFoundException' || /not found/i.test(err && err.message))) {
                    if (DEBUG) console.warn(`[env.loader] secret not found (skipped): ${name}`);
                    continue;
                }
                throw new Error(`[env.loader] Falha ao carregar "${name}": ${err && err.message ? err.message : err}`);
            }
        }
    }

    if (requiredKeys.length) {
        const missing = requiredKeys.filter(k => !process.env[k]);
        if (missing.length) {
            throw new Error(`[env.loader] Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
        }
    }
}

module.exports = { bootstrapEnv };