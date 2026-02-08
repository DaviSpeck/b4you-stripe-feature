import { Users } from "../../database/models/Users.mjs";

export class UsersRepository {
  static async findByID(id) {
    const user = await Users.findOne({
      where: {
        id,
      },
      attributes: [
        'id',
        'email'
      ],
      include: [
        {
          association: 'withdrawal_settings',
          attributes: [
            'blocked'
          ],
        },
      ],
    });

    if (!user) return null;
    return user.toJSON();
  }
};
