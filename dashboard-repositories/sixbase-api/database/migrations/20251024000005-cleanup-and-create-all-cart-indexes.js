module.exports = {
  up: async (queryInterface) => {
    console.log(
      '🧹 Iniciando limpeza e criação de todos os índices de performance...',
    );

    // ========================================
    // LIMPEZA - Remover todos os índices existentes
    // ========================================

    console.log('🧹 Removendo índices existentes para evitar duplicação...');

    // Lista de todos os índices que podem existir
    const indexesToRemove = [
      // Índices da primeira migração
      'idx_cart_abandoned_created_affiliate',
      'idx_cart_abandoned_product_created',
      'idx_cart_abandoned_offer_created',
      'idx_cart_abandoned_email_created',
      'idx_cart_abandoned_name_created',
      'idx_cart_updated_at_desc',
      'idx_cart_abandoned_updated_affiliate',
      'idx_products_user_id_cart',
      'idx_affiliates_user_product_cart',
      'idx_sales_items_affiliate_id_cart',
      'idx_product_offer_id_product',

      // Índices da segunda migração
      'idx_cart_abandoned_affiliate_created_updated',
      'idx_cart_abandoned_created_affiliate_updated',
      'idx_cart_abandoned_product_affiliate_updated',
      'idx_cart_abandoned_offer_affiliate_updated',
      'idx_cart_abandoned_email_affiliate_updated',
      'idx_cart_abandoned_name_affiliate_updated',
      'idx_cart_abandoned_updated_affiliate_created',
      'idx_cart_main_query_optimized',
      'idx_cart_pagination_optimized',
      'idx_products_id_user_deleted_cart',
      'idx_products_user_id_deleted_cart',
      'idx_affiliates_user_product_deleted_cart',
      'idx_affiliates_product_user_deleted_cart',
      'idx_sales_items_affiliate_id_deleted_cart',
      'idx_sales_items_id_affiliate_deleted_cart',
      'idx_product_offer_id_product_deleted_cart',
      'idx_product_offer_product_id_deleted_cart',
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
    // CRIAÇÃO - Todos os índices otimizados
    // ========================================

    console.log('🚀 Criando todos os índices otimizados...');

    // ========================================
    // CART - Índices Principais
    // ========================================

    console.log('🛒 Criando índices principais para cart...');

    // 1. Índice principal para abandoned carts
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'created_at', 'id_affiliate'],
      {
        name: 'idx_cart_abandoned_created_affiliate',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 2. Índice para filtro por produto
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'id_product', 'created_at'],
      {
        name: 'idx_cart_abandoned_product_created',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 3. Índice para filtro por oferta
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'id_offer', 'created_at'],
      {
        name: 'idx_cart_abandoned_offer_created',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 4. Índice para filtro por email
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'email', 'created_at'],
      {
        name: 'idx_cart_abandoned_email_created',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 5. Índice para filtro por nome
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'full_name', 'created_at'],
      {
        name: 'idx_cart_abandoned_name_created',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 6. Índice para ORDER BY updated_at
    await queryInterface.addIndex('cart', ['updated_at'], {
      name: 'idx_cart_updated_at_desc',
      where: {
        abandoned: true,
        deleted_at: null,
      },
    });

    // 7. Índice composto para combinação de filtros mais comuns
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'updated_at', 'id_affiliate'],
      {
        name: 'idx_cart_abandoned_updated_affiliate',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 8. Índice específico para a query principal com permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'id_affiliate', 'created_at', 'updated_at'],
      {
        name: 'idx_cart_abandoned_affiliate_created_updated',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 9. Índice para filtros de data + permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'created_at', 'id_affiliate', 'updated_at'],
      {
        name: 'idx_cart_abandoned_created_affiliate_updated',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 10. Índice para filtros de produto + permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'id_product', 'id_affiliate', 'updated_at'],
      {
        name: 'idx_cart_abandoned_product_affiliate_updated',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 11. Índice para filtros de oferta + permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'id_offer', 'id_affiliate', 'updated_at'],
      {
        name: 'idx_cart_abandoned_offer_affiliate_updated',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 12. Índice para busca por email + permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'email', 'id_affiliate', 'updated_at'],
      {
        name: 'idx_cart_abandoned_email_affiliate_updated',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 13. Índice para busca por nome + permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'full_name', 'id_affiliate', 'updated_at'],
      {
        name: 'idx_cart_abandoned_name_affiliate_updated',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 14. Índice composto para ORDER BY + filtros principais
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'updated_at', 'id_affiliate', 'created_at'],
      {
        name: 'idx_cart_abandoned_updated_affiliate_created',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 15. Índice para a query mais comum: abandoned + data + permissões
    await queryInterface.addIndex(
      'cart',
      ['abandoned', 'created_at', 'updated_at', 'id_affiliate'],
      {
        name: 'idx_cart_main_query_optimized',
        where: {
          abandoned: true,
          deleted_at: null,
        },
      },
    );

    // 16. Índice para paginação otimizada
    await queryInterface.addIndex('cart', ['abandoned', 'updated_at', 'id'], {
      name: 'idx_cart_pagination_optimized',
      where: {
        abandoned: true,
        deleted_at: null,
      },
    });

    console.log('✅ Índices principais de cart criados!');

    // ========================================
    // PRODUCTS - JOINs para Cart
    // ========================================

    console.log('📦 Criando índices para products...');

    // Verificar se o índice já existe antes de criar
    const [productsUserIndexExists] = await queryInterface.sequelize.query(`
      SELECT INDEX_NAME as indexname 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'products' 
        AND INDEX_NAME = 'idx_products_user_id_cart'
    `);

    if (productsUserIndexExists.length === 0) {
      await queryInterface.addIndex('products', ['id_user', 'id'], {
        name: 'idx_products_user_id_cart',
        where: {
          deleted_at: null,
        },
      });
    }

    // Índice específico para o JOIN com cart
    await queryInterface.addIndex('products', ['id', 'id_user', 'deleted_at'], {
      name: 'idx_products_id_user_deleted_cart',
      where: {
        deleted_at: null,
      },
    });

    // Índice para filtros de produto na query
    await queryInterface.addIndex('products', ['id_user', 'id', 'deleted_at'], {
      name: 'idx_products_user_id_deleted_cart',
      where: {
        deleted_at: null,
      },
    });

    console.log('✅ Índices de products criados!');

    // ========================================
    // AFFILIATES - JOINs para Cart
    // ========================================

    console.log('🤝 Criando índices para affiliates...');

    // Verificar se o índice já existe antes de criar
    const [affiliatesUserIndexExists] = await queryInterface.sequelize.query(`
      SELECT INDEX_NAME as indexname 
      FROM information_schema.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'affiliates' 
        AND INDEX_NAME = 'idx_affiliates_user_product_cart'
    `);

    if (affiliatesUserIndexExists.length === 0) {
      await queryInterface.addIndex('affiliates', ['id_user', 'id_product'], {
        name: 'idx_affiliates_user_product_cart',
        where: {
          deleted_at: null,
        },
      });
    }

    // Índice específico para o JOIN com cart
    await queryInterface.addIndex(
      'affiliates',
      ['id_user', 'id_product', 'deleted_at'],
      {
        name: 'idx_affiliates_user_product_deleted_cart',
        where: {
          deleted_at: null,
        },
      },
    );

    // Índice para filtros de afiliado na query
    await queryInterface.addIndex(
      'affiliates',
      ['id_product', 'id_user', 'deleted_at'],
      {
        name: 'idx_affiliates_product_user_deleted_cart',
        where: {
          deleted_at: null,
        },
      },
    );

    console.log('✅ Índices de affiliates criados!');

    // ========================================
    // SALES_ITEMS - JOINs para Cart
    // ========================================

    console.log('💳 Criando índices para sales_items...');

    await queryInterface.addIndex('sales_items', ['id_affiliate', 'id'], {
      name: 'idx_sales_items_affiliate_id_cart',
    });

    // Índice específico para o JOIN com cart
    await queryInterface.addIndex('sales_items', ['id_affiliate', 'id'], {
      name: 'idx_sales_items_affiliate_id_deleted_cart',
    });

    // Índice para filtros de sales_items na query
    await queryInterface.addIndex('sales_items', ['id', 'id_affiliate'], {
      name: 'idx_sales_items_id_affiliate_deleted_cart',
    });

    console.log('✅ Índices de sales_items criados!');

    // ========================================
    // PRODUCT_OFFER - JOINs para Cart
    // ========================================

    console.log('🎯 Criando índices para product_offer...');

    await queryInterface.addIndex('product_offer', ['id', 'id_product'], {
      name: 'idx_product_offer_id_product',
      where: {
        deleted_at: null,
      },
    });

    // Índice específico para o JOIN com cart
    await queryInterface.addIndex(
      'product_offer',
      ['id', 'id_product', 'deleted_at'],
      {
        name: 'idx_product_offer_id_product_deleted_cart',
        where: {
          deleted_at: null,
        },
      },
    );

    // Índice para filtros de oferta na query
    await queryInterface.addIndex(
      'product_offer',
      ['id_product', 'id', 'deleted_at'],
      {
        name: 'idx_product_offer_product_id_deleted_cart',
        where: {
          deleted_at: null,
        },
      },
    );

    console.log('✅ Índices de product_offer criados!');

    console.log(
      '\n✨ Todos os índices de performance para checkout abandonado criados com sucesso!',
    );
    console.log('📊 Total de índices criados:');
    console.log('   - Cart: 16 índices principais');
    console.log('   - Products: 3 índices');
    console.log('   - Affiliates: 3 índices');
    console.log('   - Sales_items: 3 índices');
    console.log('   - Product_offer: 3 índices');
    console.log('   - TOTAL: 28 índices otimizados');
  },

  down: async (queryInterface) => {
    console.log('🔄 Revertendo todos os índices de performance...');

    // Lista de todos os índices para remover
    const allIndexes = [
      // Cart indexes
      'idx_cart_abandoned_created_affiliate',
      'idx_cart_abandoned_product_created',
      'idx_cart_abandoned_offer_created',
      'idx_cart_abandoned_email_created',
      'idx_cart_abandoned_name_created',
      'idx_cart_updated_at_desc',
      'idx_cart_abandoned_updated_affiliate',
      'idx_cart_abandoned_affiliate_created_updated',
      'idx_cart_abandoned_created_affiliate_updated',
      'idx_cart_abandoned_product_affiliate_updated',
      'idx_cart_abandoned_offer_affiliate_updated',
      'idx_cart_abandoned_email_affiliate_updated',
      'idx_cart_abandoned_name_affiliate_updated',
      'idx_cart_abandoned_updated_affiliate_created',
      'idx_cart_main_query_optimized',
      'idx_cart_pagination_optimized',

      // Products indexes
      'idx_products_user_id_cart',
      'idx_products_id_user_deleted_cart',
      'idx_products_user_id_deleted_cart',

      // Affiliates indexes
      'idx_affiliates_user_product_cart',
      'idx_affiliates_user_product_deleted_cart',
      'idx_affiliates_product_user_deleted_cart',

      // Sales_items indexes
      'idx_sales_items_affiliate_id_cart',
      'idx_sales_items_affiliate_id_deleted_cart',
      'idx_sales_items_id_affiliate_deleted_cart',

      // Product_offer indexes
      'idx_product_offer_id_product',
      'idx_product_offer_id_product_deleted_cart',
      'idx_product_offer_product_id_deleted_cart',
    ];

    // Remover todos os índices
    for (const indexName of allIndexes) {
      try {
        if (indexName.startsWith('idx_cart_')) {
          await queryInterface.removeIndex('cart', indexName);
        } else if (indexName.startsWith('idx_products_')) {
          await queryInterface.removeIndex('products', indexName);
        } else if (indexName.startsWith('idx_affiliates_')) {
          await queryInterface.removeIndex('affiliates', indexName);
        } else if (indexName.startsWith('idx_sales_items_')) {
          await queryInterface.removeIndex('sales_items', indexName);
        } else if (indexName.startsWith('idx_product_offer_')) {
          await queryInterface.removeIndex('product_offer', indexName);
        }
        console.log(`✅ Removido índice: ${indexName}`);
      } catch (error) {
        console.log(`⚠️ Índice ${indexName} não existia ou já foi removido`);
      }
    }

    console.log('✅ Reversão de todos os índices concluída!');
  },
};
