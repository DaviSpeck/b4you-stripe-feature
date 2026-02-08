import { Users } from '../models/Users.mjs';

export class UsersRepository {
  static async find(id) {
    const user = await Users.findByPk(id);
    if (!user) return null;
    return user.toJSON();
  }
}
