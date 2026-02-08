const { initializeDatabase, closeDatabase, models } = require('./shared/database-init');

async function assignRoleToUser(userIdOrEmail, roleIdOrName) {
    try {
        // Buscar o usuário
        const userWhereClause = Number.isNaN(Number(userIdOrEmail))
            ? { email: userIdOrEmail }
            : { id: parseInt(userIdOrEmail, 10) };

        const user = await models.users_backoffice.findOne({
            where: userWhereClause
        });

        if (!user) {
            console.log(`ERROR: Usuário não encontrado: ${userIdOrEmail}`);
            return;
        }

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

        // Atribuir a role ao usuário
        const previousRole = user.id_role;
        await user.update({ id_role: role.id });

        console.log(`SUCCESS: Role "${role.name}" atribuída ao usuário "${user.full_name}" (${user.email})`);

        if (previousRole) {
            const previousRoleData = await models.backoffice_roles.findByPk(previousRole);
            console.log(`WARNING: Role anterior removida: "${previousRoleData?.name || 'Desconhecida'}"`);
        }
    } catch (error) {
        console.error('ERROR: Erro ao atribuir role ao usuário:', error.message);
        throw error;
    }
}

async function removeRoleFromUser(userIdOrEmail) {
    try {
        // Buscar o usuário
        const userWhereClause = Number.isNaN(Number(userIdOrEmail))
            ? { email: userIdOrEmail }
            : { id: parseInt(userIdOrEmail, 10) };

        const user = await models.users_backoffice.findOne({
            where: userWhereClause
        });

        if (!user) {
            console.log(`ERROR: Usuário não encontrado: ${userIdOrEmail}`);
            return;
        }

        if (!user.id_role) {
            console.log(`WARNING: Usuário "${user.full_name}" não possui role atribuída.`);
            return;
        }

        // Buscar a role atual
        const currentRole = await models.backoffice_roles.findByPk(user.id_role);

        // Remover a role do usuário
        await user.update({ id_role: null });

        console.log(`SUCCESS: Role "${currentRole?.name || 'Desconhecida'}" removida do usuário "${user.full_name}" (${user.email})`);
    } catch (error) {
        console.error('ERROR: Erro ao remover role do usuário:', error.message);
        throw error;
    }
}

async function listUsersWithRoles() {
    try {
        const users = await models.users_backoffice.findAll({
            include: [
                {
                    model: models.backoffice_roles,
                    as: 'role',
                    attributes: ['id', 'name', 'description']
                }
            ],
            order: [['full_name', 'ASC']]
        });

        if (users.length === 0) {
            console.log('INFO: Nenhum usuário encontrado.');
            return;
        }

        console.log('INFO: Usuários do Backoffice e suas Roles:');
        console.log('─'.repeat(100));

        users.forEach(user => {
            const roleInfo = user.role
                ? `${user.role.name} (${user.role.description})`
                : 'Nenhuma role atribuída';

            const status = user.active ? 'SUCCESS: Ativo' : 'ERROR: Inativo';
            const adminStatus = user.is_admin ? 'ADMIN: Admin' : 'USER: Usuário';

            console.log(`ID: ${user.id} | Nome: ${user.full_name} | Email: ${user.email}`);
            console.log(`    Role: ${roleInfo} | Status: ${status} | Tipo: ${adminStatus}`);
            console.log('─'.repeat(100));
        });
    } catch (error) {
        console.error('ERROR: Erro ao listar usuários:', error.message);
        throw error;
    }
}

async function getUserDetails(userIdOrEmail) {
    try {
        // Buscar o usuário
        const userWhereClause = Number.isNaN(Number(userIdOrEmail))
            ? { email: userIdOrEmail }
            : { id: parseInt(userIdOrEmail, 10) };

        const user = await models.users_backoffice.findOne({
            where: userWhereClause,
            include: [
                {
                    model: models.backoffice_roles,
                    as: 'role'
                }
            ]
        });

        if (!user) {
            console.log(`ERROR: Usuário não encontrado: ${userIdOrEmail}`);
            return;
        }

        console.log(`\nINFO: Detalhes do Usuário: ${user.full_name}`);
        console.log('─'.repeat(60));
        console.log(`ID: ${user.id}`);
        console.log(`Nome: ${user.full_name}`);
        console.log(`Email: ${user.email}`);
        console.log(`É Admin: ${user.is_admin ? 'Sim' : 'Não'}`);
        console.log(`Ativo: ${user.active ? 'Sim' : 'Não'}`);
        console.log(`Criado em: ${user.created_at}`);

        if (user.role) {
            console.log(`\nROLE: Role Atribuída:`);
            console.log(`  Nome: ${user.role.name}`);
            console.log(`  Descrição: ${user.role.description}`);
            console.log(`  ID: ${user.role.id}`);
        } else {
            console.log(`\nROLE: Role: Nenhuma role atribuída`);
        }
        console.log('─'.repeat(60));
    } catch (error) {
        console.error('ERROR: Erro ao obter detalhes do usuário:', error.message);
        throw error;
    }
}

async function listUsersByRole(roleIdOrName) {
    try {
        // Buscar a role
        const roleWhereClause = Number.isNaN(Number(roleIdOrName))
            ? { name: roleIdOrName }
            : { id: parseInt(roleIdOrName, 10) };

        const role = await models.backoffice_roles.findOne({
            where: roleWhereClause,
            include: [
                {
                    model: models.users_backoffice,
                    as: 'users',
                    attributes: ['id', 'full_name', 'email', 'is_admin', 'active', 'created_at']
                }
            ]
        });

        if (!role) {
            console.log(`ERROR: Role não encontrada: ${roleIdOrName}`);
            return;
        }

        console.log(`\nUSERS: Usuários com a Role: ${role.name}`);
        console.log(`DESC: Descrição: ${role.description}`);
        console.log('─'.repeat(80));

        if (role.users.length === 0) {
            console.log('Nenhum usuário possui esta role.');
            return;
        }

        role.users.forEach(user => {
            const status = user.active ? 'SUCCESS: Ativo' : 'ERROR: Inativo';
            const adminStatus = user.is_admin ? 'ADMIN: Admin' : 'USER: Usuário';
            console.log(`ID: ${user.id} | Nome: ${user.full_name} | Email: ${user.email} | ${status} | ${adminStatus}`);
        });
        console.log('─'.repeat(80));
    } catch (error) {
        console.error('ERROR: Erro ao listar usuários por role:', error.message);
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    await initializeDatabase();

    try {
        switch (command) {
            case 'assign':
                if (args.length < 3) {
                    console.log('ERROR: Uso: node backoffice-user-role-assigner.js assign <user_id_ou_email> <role_id_ou_nome>');
                    process.exit(1);
                }
                await assignRoleToUser(args[1], args[2]);
                break;

            case 'remove':
                if (args.length < 2) {
                    console.log('ERROR: Uso: node backoffice-user-role-assigner.js remove <user_id_ou_email>');
                    process.exit(1);
                }
                await removeRoleFromUser(args[1]);
                break;

            case 'list-users':
                await listUsersWithRoles();
                break;

            case 'user-details':
                if (args.length < 2) {
                    console.log('ERROR: Uso: node backoffice-user-role-assigner.js user-details <user_id_ou_email>');
                    process.exit(1);
                }
                await getUserDetails(args[1]);
                break;

            case 'list-by-role':
                if (args.length < 2) {
                    console.log('ERROR: Uso: node backoffice-user-role-assigner.js list-by-role <role_id_ou_nome>');
                    process.exit(1);
                }
                await listUsersByRole(args[1]);
                break;

            default:
                console.log(`
TARGET: Backoffice User Role Assigner

Comandos disponíveis:
  assign <user> <role>              - Atribuir role a um usuário
  remove <user>                     - Remover role de um usuário
  list-users                        - Listar todos os usuários e suas roles
  user-details <user>               - Mostrar detalhes de um usuário
  list-by-role <role>               - Listar usuários por role

Exemplos:
  node backoffice-user-role-assigner.js assign "admin@example.com" "Admin"
  node backoffice-user-role-assigner.js assign 1 "Manager"
  node backoffice-user-role-assigner.js remove "admin@example.com"
  node backoffice-user-role-assigner.js list-users
  node backoffice-user-role-assigner.js user-details 1
  node backoffice-user-role-assigner.js list-by-role "Admin"
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
            case 'assign':
                if (args.length < 3) {
                    console.log('ERROR: Uso: user assign <user_id_ou_email> <role_id_ou_nome>');
                    return;
                }
                await assignRoleToUser(args[1], args[2]);
                break;

            case 'remove':
                if (args.length < 2) {
                    console.log('ERROR: Uso: user remove <user_id_ou_email>');
                    return;
                }
                await removeRoleFromUser(args[1]);
                break;

            case 'list-users':
                await listUsersWithRoles();
                break;

            case 'user-details':
                if (args.length < 2) {
                    console.log('ERROR: Uso: user user-details <user_id_ou_email>');
                    return;
                }
                await getUserDetails(args[1]);
                break;

            case 'list-by-role':
                if (args.length < 2) {
                    console.log('ERROR: Uso: user list-by-role <role_id_ou_nome>');
                    return;
                }
                await listUsersByRole(args[1]);
                break;

            default:
                console.log(`
TARGET: Backoffice User Role Assigner

Comandos disponíveis:
  assign <user> <role>              - Atribuir role a um usuário
  remove <user>                     - Remover role de um usuário
  list-users                        - Listar todos os usuários e suas roles
  user-details <user>               - Mostrar detalhes de um usuário
  list-by-role <role>               - Listar usuários por role

Exemplos:
  node backoffice-user-role-assigner.js assign "admin@example.com" "Admin"
  node backoffice-user-role-assigner.js assign 1 "Manager"
  node backoffice-user-role-assigner.js remove "admin@example.com"
  node backoffice-user-role-assigner.js list-users
  node backoffice-user-role-assigner.js user-details 1
  node backoffice-user-role-assigner.js list-by-role "Admin"
        `);
                break;
        }
    } catch (error) {
        console.error('ERROR: Erro na execução:', error.message);
    }
}

module.exports = {
    assignRoleToUser,
    removeRoleFromUser,
    listUsersWithRoles,
    getUserDetails,
    listUsersByRole,
    executeCommand
};
