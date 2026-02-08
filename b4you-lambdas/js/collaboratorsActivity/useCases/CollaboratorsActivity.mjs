import { Collaborators } from '../database/models/Collaborators.mjs';
import { CollaboratorsActivity as CollaboratorsActivityModel } from '../database/models/CollaboratorsActivity.mjs';

const isEmpty = (data) => Object.keys(data).length === 0;

const resolveParams = ({ query, body, params }) => {
  if (isEmpty(query) && isEmpty(body) && isEmpty(params)) return null;

  return {
    query,
    body,
    params,
  };
};

export class CollaboratorsActivity {
  constructor(data) {
    this.data = data;
  }

  async store() {
    console.log(this.data);
    const { id_user, id_user_request } = this.data;
    const { id: id_collaborator } = await Collaborators.findOne({
      raw: true,
      where: {
        id_producer: id_user,
        id_user: id_user_request,
      },
      attributes: ['id'],
    });
    await CollaboratorsActivityModel.create({
      ...this.data,
      id_collaborator,
      params: resolveParams(this.data),
    });
  }
}
