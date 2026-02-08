module.exports = {
  up: async (queryInterface) => {
    console.log(
      '🚀 Iniciando limpeza e criação de índices ultra específicos de performance...',
    );

    // ========================================
    // LIMPEZA - Remover todos os índices existentes
    // ========================================

    console.log('🧹 Removendo índices existentes para evitar conflitos...');

    // Lista de todos os índices que podem existir
    const indexesToRemove = [
      // Índices ultra específicos (caso já existam)
      'idx_cart_ultra_main_query',
      'idx_cart_ultra_date_permissions',
      'idx_cart_ultra_product_permissions',
      'idx_cart_ultra_offer_permissions',
      'idx_cart_ultra_email_permissions',
      'idx_cart_ultra_name_permissions',
      'idx_cart_ultra_combined_filters',
      'idx_cart_ultra_pagination',
      'idx_cart_ultra_main_optimized',
      'idx_cart_ultra_pagination_permissions',
      'idx_cart_ultra_date_pagination',
      'idx_cart_ultra_product_pagination',
      'idx_products_ultra_cart_join',
      'idx_products_ultra_cart_filter',
      'idx_affiliates_ultra_cart_join',
      'idx_affiliates_ultra_cart_filter',
      'idx_sales_items_ultra_cart_join',
      'idx_sales_items_ultra_cart_filter',
      'idx_product_offer_ultra_cart_join',
      'idx_product_offer_ultra_cart_filter',
    ];

    // Remover índices do cart
    for (const indexName of indexesToRemove.filter((name) =>
      name.startsWith('idx_cart_'),
    )) {
      try {
        await queryInterface.removeIndex('cart', indexName);
        console.log(`✅ Removido índice: ${indexName}`);
      } catch (error) {
        console.log(`⚠️ Índice ${indexName} não existia ou já foi removido`);
      }
    }

    // Remover índices de products
    for (const indexName of indexesToRemove.filter((name) =>
      name.startsWith('idx_products_'),
    )) {
      try {
        await queryInterface.removeIndex('products', indexName);
        console.log(`✅ Removido índice: ${indexName}`);
      } catch (error) {
        console.log(`⚠️ Índice ${indexName} não existia ou já foi removido`);
      }
    }

    // Remover índices de affiliates
    for (const indexName of indexesToRemove.filter((name) =>
      name.startsWith('idx_affiliates_'),
    )) {
      try {
        await queryInterface.removeIndex('affiliates', indexName);
        console.log(`✅ Removido índice: ${indexName}`);
      } catch (error) {
        console.log(`⚠️ Índice ${indexName} não existia ou já foi removido`);
      }
    }

    // Remover índices de sales_items
    for (const indexName of indexesToRemove.filter((name) =>
      name.startsWith('idx_sales_items_'),
    )) {
      try {
        await queryInterface.removeIndex('sales_items', indexName);
        console.log(`✅ Removido índice: ${indexName}`);
      } catch (error) {
        console.log(`⚠️ Índice ${indexName} não existia ou já foi removido`);
      }
    }

    // Remover índices de product_offer
    for (const indexName of indexesToRemove.filter((name) =>
      name.startsWith('idx_product_offer_'),
    )) {
      try {
        await queryInterface.removeIndex('product_offer', indexName);
        console.log(`✅ Removido índice: ${indexName}`);
      } catch (error) {
        console.log(`⚠️ Índice ${indexName} não existia ou já foi removido`);
      }
    }

    console.log('✅ Limpeza de índices concluída!');

    // ========================================
    // CRIAÇÃO - Índices Ultra Específicos
    // ========================================

    console.log('🚀 Criando índices ultra específicos de performance...');

    // ========================================
    // CART - Índices Ultra Específicos
    // ========================================

    console.log('🛒 Criando índices ultra específicos para cart...');

    // 1. Índice para a query mais comum com permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'created_at', 'updated_at', 'id_affiliate', 'id'],
      {
        name: 'idx_cart_ultra_main_query',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 2. Índice para filtros de data + permissões + ordenação
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'created_at', 'id_affiliate', 'updated_at', 'id'],
      {
        name: 'idx_cart_ultra_date_permissions',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 3. Índice para filtros de produto + permissões + ordenação
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'id_product', 'id_affiliate', 'updated_at', 'id'],
      {
        name: 'idx_cart_ultra_product_permissions',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 4. Índice para filtros de oferta + permissões + ordenação
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'id_offer', 'id_affiliate', 'updated_at', 'id'],
      {
        name: 'idx_cart_ultra_offer_permissions',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 5. Índice para busca por email + permissões + ordenação
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'email', 'id_affiliate', 'updated_at', 'id'],
      {
        name: 'idx_cart_ultra_email_permissions',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 6. Índice para busca por nome + permissões + ordenação
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'full_name', 'id_affiliate', 'updated_at', 'id'],
      {
        name: 'idx_cart_ultra_name_permissions',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 7. Índice para combinação de filtros mais comuns
    await queryInterface.addIndex(
      'cart',
      [
        'abandoned',
        'created_at',
        'id_product',
        'id_offer',
        'id_affiliate',
        'updated_at',
        'id',
      ],
      {
        name: 'idx_cart_ultra_combined_filters',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 8. Índice para paginação ultra otimizada
    await queryInterface.addIndex('cart', ['abandoned', 'updated_at', 'id'], {
      name: 'idx_cart_ultra_pagination',
      where: {
        abandoned: true,
        deleted_at: null,
      },
    });

    console.log('✅ Índices ultra específicos de cart criados!');

    // ========================================
    // PRODUCTS - Índices Ultra Específicos
    // ========================================

    console.log('📦 Criando índices ultra específicos para products...');

    // 9. Índice ultra específico para JOINs com cart
    await queryInterface.addIndex('products', ['id', 'id_user', 'deleted_at'], {
      name: 'idx_products_ultra_cart_join',
      where: {
        deleted_at: null,
      },
    });

    // 10. Índice para filtros de produto na query
    await queryInterface.addIndex('products', ['id_user', 'id', 'deleted_at'], {
      name: 'idx_products_ultra_cart_filter',
      where: {
        deleted_at: null,
      },
    });

    console.log('✅ Índices ultra específicos de products criados!');

    // ========================================
    // AFFILIATES - Índices Ultra Específicos
    // ========================================

    console.log('🤝 Criando índices ultra específicos para affiliates...');

    // 11. Índice ultra específico para JOINs com cart
    await queryInterface.addIndex(
      'affiliates',
      ['id_user', 'id_product', 'deleted_at'],
      {
        name: 'idx_affiliates_ultra_cart_join',
        where: {
          deleted_at: null,
        },
      },
    );

    // 12. Índice para filtros de afiliado na query
    await queryInterface.addIndex(
      'affiliates',
      ['id_product', 'id_user', 'deleted_at'],
      {
        name: 'idx_affiliates_ultra_cart_filter',
        where: {
          deleted_at: null,
        },
      },
    );

    console.log('✅ Índices ultra específicos de affiliates criados!');

    // ========================================
    // SALES_ITEMS - Índices Ultra Específicos
    // ========================================

    console.log('💳 Criando índices ultra específicos para sales_items...');

    // 13. Índice ultra específico para JOINs com cart
    await queryInterface.addIndex('sales_items', ['id_affiliate', 'id'], {
      name: 'idx_sales_items_ultra_cart_join',
    });

    // 14. Índice para filtros de sales_items na query
    await queryInterface.addIndex('sales_items', ['id', 'id_affiliate'], {
      name: 'idx_sales_items_ultra_cart_filter',
    });

    console.log('✅ Índices ultra específicos de sales_items criados!');

    // ========================================
    // PRODUCT_OFFER - Índices Ultra Específicos
    // ========================================

    console.log('🎯 Criando índices ultra específicos para product_offer...');

    // 15. Índice ultra específico para JOINs com cart
    await queryInterface.addIndex(
      'product_offer',
      ['id', 'id_product', 'deleted_at'],
      {
        name: 'idx_product_offer_ultra_cart_join',
        where: {
          deleted_at: null,
        },
      },
    );

    // 16. Índice para filtros de oferta na query
    await queryInterface.addIndex(
      'product_offer',
      ['id_product', 'id', 'deleted_at'],
      {
        name: 'idx_product_offer_ultra_cart_filter',
        where: {
          deleted_at: null,
        },
      },
    );

    console.log('✅ Índices ultra específicos de product_offer criados!');

    // ========================================
    // ÍNDICES ADICIONAIS PARA COMBINAÇÕES ESPECÍFICAS
    // ========================================

    console.log('🔧 Criando índices para combinações ultra específicas...');

    // 17. Índice para a query mais comum: abandoned + data + permissões + ordenação
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'created_at', 'updated_at', 'id_affiliate', 'id'],
      {
        name: 'idx_cart_ultra_main_optimized',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 18. Índice para paginação ultra otimizada com permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'updated_at', 'id_affiliate', 'id'],
      {
        name: 'idx_cart_ultra_pagination_permissions',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 19. Índice para filtros de data + permissões + ordenação + paginação
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'created_at', 'updated_at', 'id_affiliate', 'id'],
      {
        name: 'idx_cart_ultra_date_pagination',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 20. Índice para filtros de produto + permissões + ordenação + paginação
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'id_product', 'updated_at', 'id_affiliate', 'id'],
      {
        name: 'idx_cart_ultra_product_pagination',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    console.log('✅ Índices para combinações ultra específicas criados!');

    console.log(
      '\n✨ Índices ultra específicos de performance criados com sucesso!',
    );
    console.log('📊 Total de índices ultra específicos criados:');
    console.log('   - Cart: 8 índices ultra específicos');
    console.log('   - Products: 2 índices ultra específicos');
    console.log('   - Affiliates: 2 índices ultra específicos');
    console.log('   - Sales_items: 2 índices ultra específicos');
    console.log('   - Product_offer: 2 índices ultra específicos');
    console.log('   - Combinações: 4 índices ultra otimizados');
    console.log('   - TOTAL: 20 índices ultra específicos');
  },

  down: async (queryInterface) => {
    console.log('🔄 Revertendo índices ultra específicos de performance...');

    // Lista de todos os índices ultra específicos para remover
    const ultraIndexes = [
      // Cart indexes ultra específicos
      'idx_cart_ultra_main_query',
      'idx_cart_ultra_date_permissions',
      'idx_cart_ultra_product_permissions',
      'idx_cart_ultra_offer_permissions',
      'idx_cart_ultra_email_permissions',
      'idx_cart_ultra_name_permissions',
      'idx_cart_ultra_combined_filters',
      'idx_cart_ultra_pagination',
      'idx_cart_ultra_main_optimized',
      'idx_cart_ultra_pagination_permissions',
      'idx_cart_ultra_date_pagination',
      'idx_cart_ultra_product_pagination',

      // Products indexes ultra específicos
      'idx_products_ultra_cart_join',
      'idx_products_ultra_cart_filter',

      // Affiliates indexes ultra específicos
      'idx_affiliates_ultra_cart_join',
      'idx_affiliates_ultra_cart_filter',

      // Sales_items indexes ultra específicos
      'idx_sales_items_ultra_cart_join',
      'idx_sales_items_ultra_cart_filter',

      // Product_offer indexes ultra específicos
      'idx_product_offer_ultra_cart_join',
      'idx_product_offer_ultra_cart_filter',
    ];

    // Remover todos os índices ultra específicos
    for (const indexName of ultraIndexes) {
      try {
        if (indexName.startsWith('idx_cart_ultra_')) {
          await queryInterface.removeIndex('cart', indexName);
        } else if (indexName.startsWith('idx_products_ultra_')) {
          await queryInterface.removeIndex('products', indexName);
        } else if (indexName.startsWith('idx_affiliates_ultra_')) {
          await queryInterface.removeIndex('affiliates', indexName);
        } else if (indexName.startsWith('idx_sales_items_ultra_')) {
          await queryInterface.removeIndex('sales_items', indexName);
        } else if (indexName.startsWith('idx_product_offer_ultra_')) {
          await queryInterface.removeIndex('product_offer', indexName);
        }
        console.log(`✅ Removido índice: ${indexName}`);
      } catch (error) {
        console.log(`⚠️ Índice ${indexName} não existia ou já foi removido`);
      }
    }

    console.log('✅ Reversão dos índices ultra específicos concluída!');
  },
};
