const { regionToStates } = require('../mocks/region.mock');
const { rolesTypes } = require('../types/roles');
const { OP } = require('../repositories/sequelize/Sequelize');

function processStateAndRegionFromAgg(rows) {
    const stateCounts = {};
    const regionCounts = {};

    for (const row of rows || []) {
        const ufRaw = row.state;
        const uf = ufRaw ? String(ufRaw).trim().toUpperCase() : null;
        if (!uf) continue;

        if (!stateCounts[uf]) {
            stateCounts[uf] = {
                total: 0,
                roles: { producer: 0, coproducer: 0, affiliate: 0, supplier: 0 },
            };
        }
        stateCounts[uf].total += Number(row.count || 0);

        let regionName = 'Indefinido';
        for (const [name, states] of Object.entries(regionToStates)) {
            if (states.includes(uf)) {
                regionName = name;
                break;
            }
        }

        if (!regionCounts[regionName]) {
            regionCounts[regionName] = {
                total: 0,
                roles: { producer: 0, coproducer: 0, affiliate: 0, supplier: 0 },
            };
        }
        regionCounts[regionName].total += Number(row.count || 0);

        const roleId = row.role != null ? Number(row.role) : null;
        if (!Number.isNaN(roleId)) {
            const roleInfo = rolesTypes.find((r) => r.id === roleId);
            if (roleInfo) {
                const key = roleInfo.key;
                if (stateCounts[uf].roles[key] !== undefined) {
                    stateCounts[uf].roles[key] += Number(row.count || 0);
                }
                if (regionCounts[regionName].roles[key] !== undefined) {
                    regionCounts[regionName].roles[key] += Number(row.count || 0);
                }
            }
        }
    }

    for (const name of Object.keys(regionToStates)) {
        if (!regionCounts[name]) {
            regionCounts[name] = {
                total: 0,
                roles: { producer: 0, coproducer: 0, affiliate: 0, supplier: 0 },
            };
        }
    }

    return { stateCounts, regionCounts };
}

module.exports = {
    processStateAndRegionFromAgg,
};