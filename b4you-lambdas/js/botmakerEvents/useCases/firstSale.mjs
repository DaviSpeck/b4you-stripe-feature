import { QueryTypes } from "sequelize";

const ROLES = {
    PRODUCER: 1,
    AFFILIATE: 3,
};

export async function firstSale(sequelize, models, { id_user }) {
    const user = await models.Users.findOne({ where: { id: id_user }, raw: true });

    if (!user) throw new Error(`User not found: ${id_user}`);
    if (!user.whatsapp) throw new Error(`User ${id_user} has no WhatsApp`);

    const rows = await sequelize.query(
        `
        SELECT id_role, COUNT(*) AS total
        FROM ${models.Commissions.getTableName()}
        WHERE id_user = :id_user
        GROUP BY id_role
        `,
        {
            replacements: { id_user },
            type: QueryTypes.SELECT,
        }
    );

    if (!rows.length) {
        throw new Error(`User ${id_user} has no commissions`);
    }

    const totalCommissions = rows.reduce((sum, r) => sum + Number(r.total), 0);

    if (totalCommissions !== 1) {
        throw new Error(
            `User ${id_user} is not first_sale (total commissions = ${totalCommissions})`
        );
    }

    const onlyRow = rows[0];
    const roleId = Number(onlyRow.id_role);

    let roleKey = "generic";

    if (roleId === ROLES.PRODUCER) {
        roleKey = "producer";
    } else if (roleId === ROLES.AFFILIATE) {
        roleKey = "affiliate";
    }

    return {
        id: user.id,
        name: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        phone: user.whatsapp,
        roleType: roleKey,
    };
}