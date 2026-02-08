const Sequelize = require('sequelize');

module.exports = class MembershipPageLayouts extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        version: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '1.0',
        },
        apply_membership_colors: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        hex_color_membership_primary: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        hex_color_membership_secondary: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        hex_color_membership_text: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        hex_color_membership_hover: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cover_custom: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cover_custom_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        module_cover_format: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        banner: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        banner_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        banner_mobile: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        banner_mobile_key: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        modules_title: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Módulos do Curso',
        },
        modules_show_progress: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        modules_layout: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'grid',
        },
        modules_columns: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 4,
        },
        description_title: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Sobre o Curso',
        },
        description_use_product_description: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        description_content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        description_show_stats: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        producer_title: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Sobre o Produtor',
        },
        producer_biography: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        producer_show_biography: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        producer_show_avatar: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        producer_show_social_links: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        producer_layout: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'horizontal',
        },
        cta_title: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cta_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        cta_button_text: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cta_button_link: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cta_button_style: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'primary',
        },
        cta_alignment: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'center',
        },
        cta_background_color: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        faq_title: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Perguntas Frequentes',
        },
        faq_items: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        faq_allow_multiple_open: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        social_title: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Me siga nas redes',
        },
        social_alignment: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'center',
        },
        social_style: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'icons',
        },
        social_links: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        layout_data: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Array completo de blocos com ordem preservada',
        },
        recommended_products_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Se produtos recomendados estão habilitados',
        },
        recommended_products: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Array de produtos recomendados [{id_product, order}]',
        },
        recommended_products_layout: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'horizontal',
          comment:
            'Layout dos produtos recomendados: horizontal (carousel) ou vertical (grid)',
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'membership_page_layouts',
      },
    );

    return this;
  }
};
