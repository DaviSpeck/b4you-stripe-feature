'use strict';

module.exports = {
  up: async (queryInterface) => {
    console.log('🚀 Iniciando criação de índices de performance - Fase 2...');

    // ========================================
    // STUDENTS - Login e Acesso
    // ========================================

    console.log('👥 Criando índices para students...');

    await queryInterface.addIndex('students', ['email'], {
      name: 'idx_students_email',
    });

    await queryInterface.addIndex('students', ['uuid'], {
      name: 'idx_students_uuid',
    });

    await queryInterface.addIndex('students', ['document_number'], {
      name: 'idx_students_document',
    });

    console.log('✅ Índices de students criados!');

    // ========================================
    // SALES - Listagens e Relatórios
    // ========================================

    console.log('🛒 Criando índices para sales...');

    await queryInterface.addIndex('sales', ['id_student', 'created_at'], {
      name: 'idx_sales_student_created',
    });

    await queryInterface.addIndex('sales', ['id_user', 'created_at'], {
      name: 'idx_sales_user_created',
    });

    await queryInterface.addIndex('sales', ['uuid'], {
      name: 'idx_sales_uuid',
    });

    console.log('✅ Índices de sales criados!');

    // ========================================
    // AFFILIATES - Gestão de Afiliados
    // ========================================

    console.log('🤝 Criando índices para affiliates...');

    await queryInterface.addIndex(
      'affiliates',
      ['id_user', 'id_product', 'status'],
      {
        name: 'idx_affiliates_user_product',
      },
    );

    await queryInterface.addIndex(
      'affiliates',
      ['id_product', 'status', 'created_at'],
      {
        name: 'idx_affiliates_product_status',
      },
    );

    await queryInterface.addIndex('affiliates', ['uuid'], {
      name: 'idx_affiliates_uuid',
    });

    console.log('✅ Índices de affiliates criados!');

    // ========================================
    // PRODUCTS - Catálogo e Buscas
    // ========================================

    console.log('📦 Criando índices para products...');

    await queryInterface.addIndex('products', ['id_user', 'created_at'], {
      name: 'idx_products_user_created',
    });

    const [uuidIndexExists] = await queryInterface.sequelize.query(`
      SELECT INDEX_NAME as indexname 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND INDEX_NAME = 'idx_products_uuid'
    `);

    if (uuidIndexExists.length === 0) {
      await queryInterface.addIndex('products', ['uuid'], {
        name: 'idx_products_uuid',
      });
    }

    await queryInterface.addIndex('products', ['id_user', 'id_type'], {
      name: 'idx_products_user_type',
    });

    console.log('✅ Índices de products criados!');

    // ========================================
    // COMMISSIONS - Índices Adicionais
    // ========================================

    console.log('💰 Criando índices adicionais para commissions...');

    await queryInterface.addIndex(
      'commissions',
      ['release_date', 'id_status'],
      {
        name: 'idx_commissions_release_date',
      },
    );

    await queryInterface.addIndex(
      'commissions',
      ['id_role', 'id_status', 'created_at'],
      {
        name: 'idx_commissions_role_status',
      },
    );

    console.log('✅ Índices adicionais de commissions criados!');

    console.log('\n✨ Fase 2 concluída com sucesso!');
  },

  down: async (queryInterface) => {
    console.log('🔄 Revertendo índices de performance - Fase 2...');

    // Students
    await queryInterface.removeIndex('students', 'idx_students_email');
    await queryInterface.removeIndex('students', 'idx_students_uuid');
    await queryInterface.removeIndex('students', 'idx_students_document');

    // Sales
    await queryInterface.removeIndex('sales', 'idx_sales_student_created');
    await queryInterface.removeIndex('sales', 'idx_sales_user_created');
    await queryInterface.removeIndex('sales', 'idx_sales_uuid');

    // Affiliates
    await queryInterface.removeIndex(
      'affiliates',
      'idx_affiliates_user_product',
    );
    await queryInterface.removeIndex(
      'affiliates',
      'idx_affiliates_product_status',
    );
    await queryInterface.removeIndex('affiliates', 'idx_affiliates_uuid');

    // Products
    await queryInterface.removeIndex('products', 'idx_products_user_created');

    const [uuidIndexExists] = await queryInterface.sequelize.query(`
      SELECT INDEX_NAME as indexname 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND INDEX_NAME = 'idx_products_uuid'
    `);

    if (uuidIndexExists.length > 0) {
      await queryInterface.removeIndex('products', 'idx_products_uuid');
    }

    await queryInterface.removeIndex('products', 'idx_products_user_type');

    // Commissions
    await queryInterface.removeIndex(
      'commissions',
      'idx_commissions_release_date',
    );
    await queryInterface.removeIndex(
      'commissions',
      'idx_commissions_role_status',
    );

    console.log('✅ Reversão concluída!');
  },
};
