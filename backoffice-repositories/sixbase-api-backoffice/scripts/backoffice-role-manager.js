const { initializeDatabase, models } = require('./shared/database-init');

async function addRole(name, description) {
    try {
        const [role, created] = await models.backoffice_roles.findOrCreate({
            where: { name },
            defaults: {
                name,
                description
            }
        });

        if (created) {
            console.log(`SUCCESS: Role "${name}" criada com sucesso! ID: ${role.id}`);
        } else {
            console.log(`WARNING: Role "${name}" já existe! ID: ${role.id}`);
        }
        return role;
    } catch (error) {
        console.error(`ERROR: Erro ao criar role "${name}":`, error.message);
        throw error;
    }
}

async function removeRole(roleIdOrName) {
    try {
        const whereClause = Number.isNaN(Number(roleIdOrName))
            ? { name: roleIdOrName }
            : { id: parseInt(roleIdOrName, 10) };

        const role = await models.backoffice_roles.findOne({
            where: whereClause
        });

        if (!role) {
            console.log(`WARNING: Role não encontrada: ${roleIdOrName}`);
            return;
        }

        await models.menu_items_roles.destroy({
            where: { role_id: role.id }
        });

        await models.users_backoffice.update(
            { id_role: null },
            { where: { id_role: role.id } }
        );

        await role.destroy();

        console.log(`SUCCESS: Role "${role.name}" removida com sucesso!`);
    } catch (error) {
        console.error(`ERROR: Erro ao remover role:`, error.message);
        throw error;
    }
}

async function listRoles() {
    try {
        const roles = await models.backoffice_roles.findAll({
            order: [['name', 'ASC']]
        });

        if (roles.length === 0) {
            console.log('INFO: Nenhuma role encontrada.');
            return;
        }

        console.log('INFO: Roles disponíveis:');
        console.log('─'.repeat(60));
        roles.forEach(role => {
            console.log(`ID: ${role.id} | Nome: ${role.name} | Descrição: ${role.description}`);
        });
        console.log('─'.repeat(60));
    } catch (error) {
        console.error('ERROR: Erro ao listar roles:', error.message);
        throw error;
    }
}

async function getRoleDetails(roleIdOrName) {
    try {
        const whereClause = Number.isNaN(Number(roleIdOrName))
            ? { name: roleIdOrName }
            : { id: parseInt(roleIdOrName, 10) };

        const role = await models.backoffice_roles.findOne({
            where: whereClause,
            include: [
                {
                    model: models.menu_items,
                    as: 'menuItems',
                    through: { attributes: [] }
                },
                {
                    model: models.users_backoffice,
                    as: 'users',
                    attributes: ['id', 'full_name', 'email']
                }
            ]
        });

        if (!role) {
            console.log(`WARNING: Role não encontrada: ${roleIdOrName}`);
            return;
        }

        console.log(`\nINFO: Detalhes da Role: ${role.name}`);
        console.log('─'.repeat(60));
        console.log(`ID: ${role.id}`);
        console.log(`Nome: ${role.name}`);
        console.log(`Descrição: ${role.description}`);
        console.log(`Criada em: ${role.created_at}`);

        console.log(`\nLINK: Menu Items associados (${role.menuItems.length}):`);
        if (role.menuItems.length > 0) {
            role.menuItems.forEach(item => {
                console.log(`  - ${item.key} (${item.route})`);
            });
        } else {
            console.log('  Nenhum menu item associado.');
        }

        console.log(`\nUSERS: Usuários com esta role (${role.users.length}):`);
        if (role.users.length > 0) {
            role.users.forEach(user => {
                console.log(`  - ${user.full_name} (${user.email})`);
            });
        } else {
            console.log('  Nenhum usuário com esta role.');
        }
        console.log('─'.repeat(60));
    } catch (error) {
        console.error('ERROR: Erro ao obter detalhes da role:', error.message);
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
                    console.log('ERROR: Uso: role add <nome> <descrição>');
                    return;
                }
                await addRole(args[1], args[2]);
                break;

            case 'remove':
                if (args.length < 2) {
                    console.log('ERROR: Uso: role remove <id_ou_nome>');
                    return;
                }
                await removeRole(args[1]);
                break;

            case 'list':
                await listRoles();
                break;

            case 'details':
                if (args.length < 2) {
                    console.log('ERROR: Uso: role details <id_ou_nome>');
                    return;
                }
                await getRoleDetails(args[1]);
                break;

            default:
                console.log(`
TARGET: Backoffice Role Manager

Comandos disponíveis:
  add <nome> <descrição>     - Adicionar uma nova role
  remove <id_ou_nome>        - Remover uma role
  list                       - Listar todas as roles
  details <id_ou_nome>       - Mostrar detalhes de uma role

Exemplos:
  node backoffice-role-manager.js add "Admin" "Administrador do sistema"
  node backoffice-role-manager.js remove "Admin"
  node backoffice-role-manager.js list
  node backoffice-role-manager.js details 1
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
    addRole,
    removeRole,
    listRoles,
    getRoleDetails,
    executeCommand
};
