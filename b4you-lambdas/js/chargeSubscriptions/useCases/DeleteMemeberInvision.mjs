export class DeleteMemberInvision {
  constructor(Invision, database) {
    this.Invision = Invision;
    this.database = database;
  }

  async execute({ id_user, id_product, email }) {
    const integration = await this.database.query(
      'select id, settings from plugins where id_user = :id_user and id_plugin = 13',
      {
        replacements: {
          id_user,
        },
        plain: true,
      }
    );
    if (!integration) return;
    const plugin_product = await this.database.query(
      'select id from plugins_products where id_plugin = :id_plugin and id_product = :id_product',
      {
        replacements: {
          id_plugin: integration.id,
          id_product,
        },
        plain: true,
      }
    );
    if (!plugin_product) return;
    await new this.Invision(
      integration.settings.api_url,
      integration.settings.api_key
    ).deleteMemberGroup({ email });
  }
}
