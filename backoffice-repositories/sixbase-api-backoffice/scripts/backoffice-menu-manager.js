const { initializeDatabase, models } = require('./shared/database-init');

async function addMenuItem(key, route) {
    try {
        const [menuItem, created] = await models.menu_items.findOrCreate({
            where: { key },
            defaults: {
                key,
                route
            }
        });

        if (created) {
            console.log(`SUCCESS: Menu item "${key}" criado com sucesso! ID: ${menuItem.id}`);
        } else {
            console.log(`WARNING: Menu item "${key}" já existe! ID: ${menuItem.id}`);
        }
        return menuItem;
    } catch (error) {
        console.error(`ERROR: Erro ao criar menu item "${key}":`, error.message);
        throw error;
    }
}

async function removeMenuItem(keyOrId) {
    try {
        const whereClause = Number.isNaN(Number(keyOrId))
            ? { key: keyOrId }
            : { id: parseInt(keyOrId, 10) };

        const menuItem = await models.menu_items.findOne({
            where: whereClause
        });

        if (!menuItem) {
            console.log(`WARNING: Menu item não encontrado: ${keyOrId}`);
            return;
        }

        // Remove associações com roles primeiro
        await models.menu_items_roles.destroy({
            where: { menu_item_id: menuItem.id }
        });

        // Remove o menu item
        await menuItem.destroy();

        console.log(`SUCCESS: Menu item "${menuItem.key}" removido com sucesso!`);
    } catch (error) {
        console.error(`ERROR: Erro ao remover menu item:`, error.message);
        throw error;
    }
}

async function updateMenuItem(keyOrId, newRoute) {
    try {
        const whereClause = Number.isNaN(Number(keyOrId))
            ? { key: keyOrId }
            : { id: parseInt(keyOrId, 10) };

        const menuItem = await models.menu_items.findOne({
            where: whereClause
        });

        if (!menuItem) {
            console.log(`WARNING: Menu item não encontrado: ${keyOrId}`);
            return;
        }

        await menuItem.update({
            route: newRoute
        });

        console.log(`SUCCESS: Menu item "${menuItem.key}" atualizado com sucesso! Nova rota: ${newRoute}`);
    } catch (error) {
        console.error(`ERROR: Erro ao atualizar menu item:`, error.message);
        throw error;
    }
}

async function listMenuItems() {
    try {
        const menuItems = await models.menu_items.findAll({
            include: [
                {
                    model: models.backoffice_roles,
                    as: 'roles',
                    through: { attributes: [] }
                }
            ],
            order: [['key', 'ASC']]
        });

        if (menuItems.length === 0) {
            console.log('INFO: Nenhum menu item encontrado.');
            return;
        }

        console.log('INFO: Menu Items disponíveis:');
        console.log('─'.repeat(80));
        menuItems.forEach(item => {
            const rolesText = item.roles.length > 0
                ? item.roles.map(r => r.name).join(', ')
                : 'Nenhuma role associada';
            console.log(`ID: ${item.id} | Key: ${item.key} | Route: ${item.route} | Roles: ${rolesText}`);
        });
        console.log('─'.repeat(80));
    } catch (error) {
        console.error('ERROR: Erro ao listar menu items:', error.message);
        throw error;
    }
}

async function getMenuItemDetails(keyOrId) {
    try {
        const whereClause = Number.isNaN(Number(keyOrId))
            ? { key: keyOrId }
            : { id: parseInt(keyOrId, 10) };

        const menuItem = await models.menu_items.findOne({
            where: whereClause,
            include: [
                {
                    model: models.backoffice_roles,
                    as: 'roles',
                    through: { attributes: [] }
                }
            ]
        });

        if (!menuItem) {
            console.log(`WARNING: Menu item não encontrado: ${keyOrId}`);
            return;
        }

        console.log(`\nINFO: Detalhes do Menu Item: ${menuItem.key}`);
        console.log('─'.repeat(60));
        console.log(`ID: ${menuItem.id}`);
        console.log(`Key: ${menuItem.key}`);
        console.log(`Route: ${menuItem.route}`);
        console.log(`Criado em: ${menuItem.created_at}`);
        console.log(`Atualizado em: ${menuItem.updated_at}`);

        console.log(`\nLINK: Roles associadas (${menuItem.roles.length}):`);
        if (menuItem.roles.length > 0) {
            menuItem.roles.forEach(role => {
                console.log(`  - ${role.name} (${role.description})`);
            });
        } else {
            console.log('  Nenhuma role associada.');
        }
        console.log('─'.repeat(60));
    } catch (error) {
        console.error('ERROR: Erro ao obter detalhes do menu item:', error.message);
        throw error;
    }
}

async function executeCommand(args) {
    const command = args[0];


    await initializeDatabase();

    try {
        switch (command) {
            case 'add':
                if (args.length < 3) {
                    console.log('ERROR: Uso: menu add <key> <route>');
                    return;
                }
                await addMenuItem(args[1], args[2]);
                break;

            case 'remove':
                if (args.length < 2) {
                    console.log('ERROR: Uso: menu remove <key_ou_id>');
                    return;
                }
                await removeMenuItem(args[1]);
                break;

            case 'update':
                if (args.length < 3) {
                    console.log('ERROR: Uso: menu update <key_ou_id> <nova_route>');
                    return;
                }
                await updateMenuItem(args[1], args[2]);
                break;

            case 'list':
                await listMenuItems();
                break;

            case 'details':
                if (args.length < 2) {
                    console.log('ERROR: Uso: menu details <key_ou_id>');
                    return;
                }
                await getMenuItemDetails(args[1]);
                break;

            default:
                console.log(`
TARGET: Backoffice Menu Manager

Comandos disponíveis:
  add <key> <route>           - Adicionar um novo menu item
  remove <key_ou_id>          - Remover um menu item
  update <key_ou_id> <route>  - Atualizar a rota de um menu item
  list                        - Listar todos os menu items
  details <key_ou_id>         - Mostrar detalhes de um menu item

Exemplos:
  node backoffice-menu-manager.js add "dashboard" "/dashboard"
  node backoffice-menu-manager.js remove "dashboard"
  node backoffice-menu-manager.js update "dashboard" "/admin/dashboard"
  node backoffice-menu-manager.js list
  node backoffice-menu-manager.js details "dashboard"
        `);
                break;
        }
    } catch (error) {
        console.error('ERROR: Erro na execução:', error.message);
    }
}

async function main() {
    const args = process.argv.slice(2);
    await executeCommand(args);
}

if (require.main === module) {
    main();
}

module.exports = {
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    listMenuItems,
    getMenuItemDetails,
    executeCommand
};
