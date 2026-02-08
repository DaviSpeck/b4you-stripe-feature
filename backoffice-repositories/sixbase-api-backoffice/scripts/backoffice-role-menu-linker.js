const { initializeDatabase, closeDatabase, models } = require('./shared/database-init');

async function linkRoleToMenuItems(roleIdOrName, menuItemKeysOrIds) {
    try {
        // Buscar a role
        const roleWhereClause = Number.isNaN(Number(roleIdOrName))
            ? { name: roleIdOrName }
            : { id: parseInt(roleIdOrName, 10) };

        const role = await models.backoffice_roles.findOne({
            where: roleWhereClause
        });

        if (!role) {
            console.log(`ERROR: Role não encontrada: ${roleIdOrName}`);
            return;
        }

        // Buscar menu items
        const menuItems = [];
        for (const keyOrId of menuItemKeysOrIds) {
            const menuWhereClause = Number.isNaN(Number(keyOrId))
                ? { key: keyOrId }
                : { id: parseInt(keyOrId, 10) };

            const menuItem = await models.menu_items.findOne({
                where: menuWhereClause
            });

            if (!menuItem) {
                console.log(`WARNING: Menu item não encontrado: ${keyOrId}`);
                continue;
            }

            menuItems.push(menuItem);
        }

        if (menuItems.length === 0) {
            console.log('ERROR: Nenhum menu item válido encontrado.');
            return;
        }

        // Criar associações
        let linkedCount = 0;
        for (const menuItem of menuItems) {
            const [association, created] = await models.menu_items_roles.findOrCreate({
                where: {
                    role_id: role.id,
                    menu_item_id: menuItem.id
                },
                defaults: {
                    role_id: role.id,
                    menu_item_id: menuItem.id
                }
            });

            if (created) {
                linkedCount++;
                console.log(`SUCCESS: Role "${role.name}" linkada ao menu item "${menuItem.key}"`);
            } else {
                console.log(`WARNING: Role "${role.name}" já estava linkada ao menu item "${menuItem.key}"`);
            }
        }

        console.log(`\nTARGET: Resumo: ${linkedCount} novas associações criadas para a role "${role.name}"`);
    } catch (error) {
        console.error('ERROR: Erro ao linkar role aos menu items:', error.message);
        throw error;
    }
}

async function unlinkRoleFromMenuItems(roleIdOrName, menuItemKeysOrIds) {
    try {
        // Buscar a role
        const roleWhereClause = Number.isNaN(Number(roleIdOrName))
            ? { name: roleIdOrName }
            : { id: parseInt(roleIdOrName, 10) };

        const role = await models.backoffice_roles.findOne({
            where: roleWhereClause
        });

        if (!role) {
            console.log(`ERROR: Role não encontrada: ${roleIdOrName}`);
            return;
        }

        // Buscar menu items
        const menuItems = [];
        for (const keyOrId of menuItemKeysOrIds) {
            const menuWhereClause = Number.isNaN(Number(keyOrId))
                ? { key: keyOrId }
                : { id: parseInt(keyOrId, 10) };

            const menuItem = await models.menu_items.findOne({
                where: menuWhereClause
            });

            if (!menuItem) {
                console.log(`WARNING: Menu item não encontrado: ${keyOrId}`);
                continue;
            }

            menuItems.push(menuItem);
        }

        if (menuItems.length === 0) {
            console.log('ERROR: Nenhum menu item válido encontrado.');
            return;
        }

        // Remover associações
        let unlinkedCount = 0;
        for (const menuItem of menuItems) {
            const deletedCount = await models.menu_items_roles.destroy({
                where: {
                    role_id: role.id,
                    menu_item_id: menuItem.id
                }
            });

            if (deletedCount > 0) {
                unlinkedCount++;
                console.log(`SUCCESS: Associação removida entre role "${role.name}" e menu item "${menuItem.key}"`);
            } else {
                console.log(`WARNING: Associação não encontrada entre role "${role.name}" e menu item "${menuItem.key}"`);
            }
        }

        console.log(`\nTARGET: Resumo: ${unlinkedCount} associações removidas para a role "${role.name}"`);
    } catch (error) {
        console.error('ERROR: Erro ao deslinkar role dos menu items:', error.message);
        throw error;
    }
}

async function unlinkAllFromRole(roleIdOrName) {
    try {
        // Buscar a role
        const roleWhereClause = Number.isNaN(Number(roleIdOrName))
            ? { name: roleIdOrName }
            : { id: parseInt(roleIdOrName, 10) };

        const role = await models.backoffice_roles.findOne({
            where: roleWhereClause
        });

        if (!role) {
            console.log(`ERROR: Role não encontrada: ${roleIdOrName}`);
            return;
        }

        // Remover todas as associações da role
        const deletedCount = await models.menu_items_roles.destroy({
            where: { role_id: role.id }
        });

        console.log(`SUCCESS: ${deletedCount} associações removidas da role "${role.name}"`);
    } catch (error) {
        console.error('ERROR: Erro ao remover todas as associações da role:', error.message);
        throw error;
    }
}

async function unlinkAllFromMenuItem(menuItemKeyOrId) {
    try {
        // Buscar o menu item
        const menuWhereClause = Number.isNaN(Number(menuItemKeyOrId))
            ? { key: menuItemKeyOrId }
            : { id: parseInt(menuItemKeyOrId, 10) };

        const menuItem = await models.menu_items.findOne({
            where: menuWhereClause
        });

        if (!menuItem) {
            console.log(`ERROR: Menu item não encontrado: ${menuItemKeyOrId}`);
            return;
        }

        // Remover todas as associações do menu item
        const deletedCount = await models.menu_items_roles.destroy({
            where: { menu_item_id: menuItem.id }
        });

        console.log(`SUCCESS: ${deletedCount} associações removidas do menu item "${menuItem.key}"`);
    } catch (error) {
        console.error('ERROR: Erro ao remover todas as associações do menu item:', error.message);
        throw error;
    }
}

async function listAssociations() {
    try {
        const roles = await models.backoffice_roles.findAll({
            include: [
                {
                    model: models.menu_items,
                    as: 'menuItems',
                    attributes: ['id', 'key', 'route'],
                    through: { attributes: [] }
                }
            ],
            order: [['name', 'ASC']]
        });

        if (roles.length === 0) {
            console.log('INFO: Nenhuma associação encontrada.');
            return;
        }

        console.log('INFO: Associações Role ↔ Menu Items:');
        console.log('─'.repeat(80));

        roles.forEach(role => {
            console.log(`\nROLE: ${role.name} (ID: ${role.id})`);
            if (role.menuItems.length === 0) {
                console.log('  Nenhum menu associado.');
            } else {
                console.log('  INFO: Menu Items:');
                role.menuItems.forEach(item => {
                    console.log(`    - ${item.key} (${item.route})`);
                });
            }
        });

        console.log('─'.repeat(80));
    } catch (error) {
        console.error('ERROR: Erro ao listar associações:', error.message);
        throw error;
    }
}


async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    await initializeDatabase();

    try {
        switch (command) {
            case 'link':
                if (args.length < 3) {
                    console.log('ERROR: Uso: node backoffice-role-menu-linker.js link <role_id_ou_nome> <menu_item1,menu_item2,...>');
                    process.exit(1);
                }
                const menuItems = args[2].split(',').map(item => item.trim());
                await linkRoleToMenuItems(args[1], menuItems);
                break;

            case 'unlink':
                if (args.length < 3) {
                    console.log('ERROR: Uso: node backoffice-role-menu-linker.js unlink <role_id_ou_nome> <menu_item1,menu_item2,...>');
                    process.exit(1);
                }
                const unlinkMenuItems = args[2].split(',').map(item => item.trim());
                await unlinkRoleFromMenuItems(args[1], unlinkMenuItems);
                break;

            case 'unlink-all-role':
                if (args.length < 2) {
                    console.log('ERROR: Uso: node backoffice-role-menu-linker.js unlink-all-role <role_id_ou_nome>');
                    process.exit(1);
                }
                await unlinkAllFromRole(args[1]);
                break;

            case 'unlink-all-menu':
                if (args.length < 2) {
                    console.log('ERROR: Uso: node backoffice-role-menu-linker.js unlink-all-menu <menu_item_key_ou_id>');
                    process.exit(1);
                }
                await unlinkAllFromMenuItem(args[1]);
                break;

            case 'list':
                await listAssociations();
                break;

            default:
                console.log(`
TARGET: Backoffice Role-Menu Linker

Comandos disponíveis:
  link <role> <menu_items>           - Linkar role a menu items (separados por vírgula)
  unlink <role> <menu_items>         - Deslinkar role de menu items (separados por vírgula)
  unlink-all-role <role>             - Remover todas as associações de uma role
  unlink-all-menu <menu_item>        - Remover todas as associações de um menu item
  list                               - Listar todas as associações

Exemplos:
  node backoffice-role-menu-linker.js link "Admin" "dashboard,users,products"
  node backoffice-role-menu-linker.js unlink "Admin" "users"
  node backoffice-role-menu-linker.js unlink-all-role "Admin"
  node backoffice-role-menu-linker.js list
        `);
                break;
        }
    } catch (error) {
        console.error('ERROR: Erro na execução:', error.message);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

if (require.main === module) {
    main();
}

async function executeCommand(args) {
    const command = args[0];

    await initializeDatabase();

    try {
        switch (command) {
            case 'link':
                if (args.length < 3) {
                    console.log('ERROR: Uso: link link <role_id_ou_nome> <menu_item1,menu_item2,...>');
                    return;
                }
                const menuItems = args[2].split(',').map(item => item.trim());
                await linkRoleToMenuItems(args[1], menuItems);
                break;

            case 'unlink':
                if (args.length < 3) {
                    console.log('ERROR: Uso: link unlink <role_id_ou_nome> <menu_item1,menu_item2,...>');
                    return;
                }
                const unlinkMenuItems = args[2].split(',').map(item => item.trim());
                await unlinkRoleFromMenuItems(args[1], unlinkMenuItems);
                break;

            case 'unlink-all-role':
                if (args.length < 2) {
                    console.log('ERROR: Uso: link unlink-all-role <role_id_ou_nome>');
                    return;
                }
                await unlinkAllFromRole(args[1]);
                break;

            case 'unlink-all-menu':
                if (args.length < 2) {
                    console.log('ERROR: Uso: link unlink-all-menu <menu_item_key_ou_id>');
                    return;
                }
                await unlinkAllFromMenuItem(args[1]);
                break;

            case 'list':
                await listAssociations();
                break;

            default:
                console.log(`
TARGET: Backoffice Role-Menu Linker

Comandos disponíveis:
  link <role> <menu_items>           - Linkar role a menu items (separados por vírgula)
  unlink <role> <menu_items>         - Deslinkar role de menu items (separados por vírgula)
  unlink-all-role <role>             - Remover todas as associações de uma role
  unlink-all-menu <menu_item>        - Remover todas as associações de um menu item
  list                               - Listar todas as associações

Exemplos:
  node backoffice-role-menu-linker.js link "Admin" "dashboard,users,products"
  node backoffice-role-menu-linker.js unlink "Admin" "users"
  node backoffice-role-menu-linker.js unlink-all-role "Admin"
  node backoffice-role-menu-linker.js list
        `);
                break;
        }
    } catch (error) {
        console.error('ERROR: Erro na execução:', error.message);
    }
}

module.exports = {
    linkRoleToMenuItems,
    unlinkRoleFromMenuItems,
    unlinkAllFromRole,
    unlinkAllFromMenuItem,
    listAssociations,
    executeCommand
};
