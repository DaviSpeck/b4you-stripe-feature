'use strict';

module.exports = {
  up: async (queryInterface) => {
    console.log('🚀 Iniciando criação de índices de performance - Fase 1...');

    // ========================================
    // SALES_ITEMS - Tabela Crítica
    // ========================================

    console.log('📊 Criando índices para sales_items...');

    await queryInterface.addIndex(
      'sales_items',
      ['id_product', 'id_status', 'created_at'],
      {
        name: 'idx_sales_items_product_status_created',
      },
    );

    await queryInterface.addIndex(
      'sales_items',
      ['id_product', 'id_status', 'paid_at'],
      {
        name: 'idx_sales_items_product_status_paid',
      },
    );

    await queryInterface.addIndex(
      'sales_items',
      ['id_student', 'id_status', 'created_at'],
      {
        name: 'idx_sales_items_student_status',
      },
    );

    await queryInterface.addIndex(
      'sales_items',
      ['id_affiliate', 'id_status', 'paid_at'],
      {
        name: 'idx_sales_items_affiliate_status',
      },
    );

    await queryInterface.addIndex('sales_items', ['uuid'], {
      name: 'idx_sales_items_uuid',
    });

    await queryInterface.addIndex('sales_items', ['id_sale'], {
      name: 'idx_sales_items_sale',
    });

    await queryInterface.addIndex(
      'sales_items',
      ['list', 'id_status', 'created_at'],
      {
        name: 'idx_sales_items_list_status',
      },
    );

    console.log('✅ Índices de sales_items criados!');

    // ========================================
    // COMMISSIONS - Cálculos Financeiros
    // ========================================

    console.log('💰 Criando índices para commissions...');

    await queryInterface.addIndex(
      'commissions',
      ['id_user', 'id_status', 'id_role', 'release_date'],
      {
        name: 'idx_commissions_user_status_role',
      },
    );

    await queryInterface.addIndex('commissions', ['id_sale_item'], {
      name: 'idx_commissions_sale_item',
    });

    await queryInterface.addIndex('commissions', ['id_user', 'created_at'], {
      name: 'idx_commissions_user_created',
    });

    await queryInterface.addIndex(
      'commissions',
      ['id_product', 'id_user', 'id_status'],
      {
        name: 'idx_commissions_product_user',
      },
    );

    console.log('✅ Índices de commissions criados!');

    // ========================================
    // TRANSACTIONS - Extratos e Saques
    // ========================================

    console.log('💳 Criando índices para transactions...');

    await queryInterface.addIndex(
      'transactions',
      ['id_user', 'id_type', 'id_status', 'created_at'],
      {
        name: 'idx_transactions_user_type_status',
      },
    );

    await queryInterface.addIndex(
      'transactions',
      ['id_user', 'id_type', 'method', 'created_at'],
      {
        name: 'idx_transactions_user_withdrawal',
      },
    );

    const [uuidIndexExists] = await queryInterface.sequelize.query(`
      SELECT INDEX_NAME as indexname 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'transactions' 
        AND INDEX_NAME = 'idx_transactions_uuid'
    `);

    if (uuidIndexExists.length === 0) {
      await queryInterface.addIndex('transactions', ['uuid'], {
        name: 'idx_transactions_uuid',
      });
    }

    await queryInterface.addIndex(
      'transactions',
      ['release_date', 'id_status', 'id_user'],
      {
        name: 'idx_transactions_release',
      },
    );

    console.log('✅ Índices de transactions criados!');

    console.log('\n✨ Fase 1 concluída com sucesso!');
    console.log('📈 Próximos passos:');
    console.log('   1. Execute ANALYZE TABLE nas tabelas afetadas');
    console.log('   2. Monitore com SHOW INDEXES FROM <table>');
    console.log('   3. Valide queries críticas com EXPLAIN');
  },

  down: async (queryInterface) => {
    console.log('🔄 Revertendo índices de performance - Fase 1...');

    await queryInterface.removeIndex(
      'sales_items',
      'idx_sales_items_product_status_created',
    );
    await queryInterface.removeIndex(
      'sales_items',
      'idx_sales_items_product_status_paid',
    );
    await queryInterface.removeIndex(
      'sales_items',
      'idx_sales_items_student_status',
    );
    await queryInterface.removeIndex(
      'sales_items',
      'idx_sales_items_affiliate_status',
    );
    await queryInterface.removeIndex('sales_items', 'idx_sales_items_uuid');
    await queryInterface.removeIndex('sales_items', 'idx_sales_items_sale');
    await queryInterface.removeIndex(
      'sales_items',
      'idx_sales_items_list_status',
    );

    // Commissions
    await queryInterface.removeIndex(
      'commissions',
      'idx_commissions_user_status_role',
    );
    await queryInterface.removeIndex(
      'commissions',
      'idx_commissions_sale_item',
    );
    await queryInterface.removeIndex(
      'commissions',
      'idx_commissions_user_created',
    );
    await queryInterface.removeIndex(
      'commissions',
      'idx_commissions_product_user',
    );

    await queryInterface.removeIndex(
      'transactions',
      'idx_transactions_user_type_status',
    );
    await queryInterface.removeIndex(
      'transactions',
      'idx_transactions_user_withdrawal',
    );

    const [uuidIndexExists] = await queryInterface.sequelize.query(`
      SELECT INDEX_NAME as indexname 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'transactions' 
        AND INDEX_NAME = 'idx_transactions_uuid'
    `);

    if (uuidIndexExists.length > 0) {
      await queryInterface.removeIndex('transactions', 'idx_transactions_uuid');
    }

    await queryInterface.removeIndex(
      'transactions',
      'idx_transactions_release',
    );

    console.log('✅ Reversão concluída!');
  },
};
