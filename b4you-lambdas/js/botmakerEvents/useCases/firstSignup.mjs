export async function firstSignup(sequelize, models, { id_user }) {
    const user = await models.Users.findOne({ where: { id: id_user }, raw: true });

    if (!user) {
        throw new Error(`User ${id_user} not found for first_signup`);
    }

    if (!user.whatsapp || user.whatsapp.trim() === "") {
        throw new Error(`User ${id_user} does not have whatsapp for first_signup`);
    }

    return {
        id: user.id,
        name: user.full_name || `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        phone: user.whatsapp,
        createdAt: user.created_at,
    };
}