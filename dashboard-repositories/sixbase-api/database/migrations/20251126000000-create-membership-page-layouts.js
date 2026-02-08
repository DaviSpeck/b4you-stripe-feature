

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('membership_page_layouts', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        unique: true,
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

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('membership_page_layouts');
  },
};
