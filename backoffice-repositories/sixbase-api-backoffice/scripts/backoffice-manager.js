const roleManager = require('./backoffice-role-manager');
const menuManager = require('./backoffice-menu-manager');
const roleMenuLinker = require('./backoffice-role-menu-linker');
const userRoleAssigner = require('./backoffice-user-role-assigner');
const { initializeDatabase, closeDatabase, sequelize, models } = require('./shared/database-init');
const { backofficeRoutes } = require('../types/backofficeRoutes');

async function setupDefaultRolesAndMenus() {
    try {
        console.log('START: Configurando roles e menu items padrão...\n');

        console.log('INFO: Criando roles padrão...');
        await roleManager.addRole('ADM', 'Administrador com acesso total a todas as funcionalidades e menus');
        await roleManager.addRole('FINANCEIRO', 'Acesso a módulos financeiros, vendas e gestão');
        await roleManager.addRole('ANALISTA_FRAUDE', 'Acesso a antifraude, vendas e módulos de segurança');
        await roleManager.addRole('COMERCIAL', 'Acesso a vendas, clientes e mercado');
        await roleManager.addRole('MARKETING', 'Acesso a marketing, vendas e mercado');
        await roleManager.addRole('SUPORTE', 'Acesso a suporte, clientes e logs');

        console.log(`\nINFO: Criando ${backofficeRoutes.length} menu items a partir do arquivo de types...`);
        await Promise.all(
            backofficeRoutes.map(route => menuManager.addMenuItem(route.key, route.route))
        );

        console.log('\nLINK: Configurando permissões padrão...');

        // ADM - acesso total a todos os menus
        const allMenuKeys = backofficeRoutes.map(r => r.key);
        await roleMenuLinker.linkRoleToMenuItems('ADM', allMenuKeys);

        // FINANCEIRO - Home, Financeiro, Pagarme, Vendas, Clientes, Produtores, Onboarding, Produtos, Conversões, Logs, Saques Manuais, Comercial, Indique e Ganhe
        await roleMenuLinker.linkRoleToMenuItems('FINANCEIRO', [
            'home', 'reports', 'pagarme', 'sales', 'students', 'producers',
            'onboarding', 'products', 'events', 'logs', 'saques',
            'commercial', 'indique-ganhe'
        ]);

        // ANALISTA_FRAUDE - Home, Financeiro, Pagarme, Vendas, Clientes, Produtores, Onboarding, Produtos, Conversões, Logs, Antifraude, Restrições, Lista de Bloqueios, Vendas por IP, Comercial, Indique e Ganhe
        await roleMenuLinker.linkRoleToMenuItems('ANALISTA_FRAUDE', [
            'home', 'reports', 'pagarme', 'sales', 'students', 'producers',
            'onboarding', 'products', 'events', 'logs', 'blacklist',
            'blocks', 'blocklist', 'sale-ip', 'commercial', 'indique-ganhe'
        ]);

        // COMERCIAL - Home, Financeiro, Vendas, Clientes, Produtores, Onboarding, Produtos, Conversões, Mercado, Logs, Restrições, Comercial, Indique e Ganhe
        await roleMenuLinker.linkRoleToMenuItems('COMERCIAL', [
            'home', 'reports', 'sales', 'students', 'producers',
            'onboarding', 'products', 'events', 'market', 'logs',
            'blocks', 'commercial', 'indique-ganhe'
        ]);

        // MARKETING - Home, Financeiro, Vendas, Clientes, Produtores, Onboarding, Produtos, Conversões, Mercado, Logs, Restrições, Comercial, Indique e Ganhe
        await roleMenuLinker.linkRoleToMenuItems('MARKETING', [
            'home', 'reports', 'sales', 'students', 'producers',
            'onboarding', 'products', 'events', 'market', 'logs',
            'blocks', 'commercial', 'indique-ganhe'
        ]);

        // SUPORTE - Home, Vendas, Clientes, Produtores, Onboarding, Produtos, Logs, Restrições, Indique e Ganhe
        await roleMenuLinker.linkRoleToMenuItems('SUPORTE', [
            'home', 'sales', 'students', 'producers', 'onboarding',
            'products', 'logs', 'blocks', 'indique-ganhe'
        ]);

        console.log('\nSUCCESS: Configuração padrão concluída com sucesso!');
        console.log('\nINFO: Resumo da configuração:');
        console.log('  - 6 roles criadas (ADM, FINANCEIRO, ANALISTA_FRAUDE, COMERCIAL, MARKETING, SUPORTE)');
        console.log(`  - ${backofficeRoutes.length} menu items criados`);
        console.log('  - Permissões configuradas:');
        console.log(`    * ADM: Acesso total (${allMenuKeys.length} menus)`);
        console.log('    * FINANCEIRO: 13 menus');
        console.log('    * ANALISTA_FRAUDE: 16 menus');
        console.log('    * COMERCIAL: 13 menus');
        console.log('    * MARKETING: 13 menus');
        console.log('    * SUPORTE: 9 menus');

    } catch (error) {
        console.error('ERROR: Erro na configuração padrão:', error.message);
        throw error;
    }
}

async function showSystemStatus() {
    try {
        console.log('STATS: Status do Sistema Backoffice\n');

        const roleCount = await models.backoffice_roles.count();
        console.log(`ROLE: Roles: ${roleCount}`);

        const menuCount = await models.menu_items.count();
        console.log(`INFO: Menu Items: ${menuCount}`);

        const associationCount = await models.menu_items_roles.count();
        console.log(`LINK: Associações Role-Menu: ${associationCount}`);

        const userCount = await models.users_backoffice.count();
        const usersWithRole = await models.users_backoffice.count({
            where: { id_role: { [sequelize.Sequelize.Op.ne]: null } }
        });
        console.log(`USERS: Usuários: ${userCount} (${usersWithRole} com role atribuída)`);

        console.log('\nINFO: Últimas 5 roles criadas:');
        const recentRoles = await models.backoffice_roles.findAll({
            order: [['created_at', 'DESC']],
            limit: 5,
            attributes: ['id', 'name', 'description', 'created_at']
        });

        recentRoles.forEach(role => {
            console.log(`  - ${role.name} (${role.description}) - ${role.created_at}`);
        });

    } catch (error) {
        console.error('ERROR: Erro ao obter status do sistema:', error.message);
        throw error;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    await initializeDatabase();

    try {
        switch (command) {
            case 'setup':
                await setupDefaultRolesAndMenus();
                break;

            case 'status':
                await showSystemStatus();
                break;

            case 'role': {
                await roleManager.executeCommand(args.slice(1));
                return;
            }

            case 'menu': {
                await menuManager.executeCommand(args.slice(1));
                return;
            }

            case 'link': {
                await roleMenuLinker.executeCommand(args.slice(1));
                return;
            }

            case 'user': {
                await userRoleAssigner.executeCommand(args.slice(1));
                return;
            }

            default:
                console.log(`
TARGET: Backoffice Manager - Sistema Completo de Gestão

Comandos principais:
  setup                          - Configurar sistema com roles e menus padrão
  status                         - Mostrar status geral do sistema

Sub-comandos por módulo:
  role <comando>                 - Gerenciar roles
    add <nome> <descrição>        - Adicionar role
    remove <id_ou_nome>           - Remover role
    list                          - Listar roles
    details <id_ou_nome>          - Detalhes da role

  menu <comando>                 - Gerenciar menu items
    add <key> <route>             - Adicionar menu item
    remove <key_ou_id>            - Remover menu item
    update <key_ou_id> <route>    - Atualizar menu item
    list                          - Listar menu items
    details <key_ou_id>           - Detalhes do menu item

  link <comando>                 - Gerenciar associações role-menu
    link <role> <menu_items>      - Linkar role a menu items
    unlink <role> <menu_items>    - Deslinkar role de menu items
    list                          - Listar associações

  user <comando>                 - Gerenciar usuários e roles
    assign <user> <role>          - Atribuir role a usuário
    remove <user>                 - Remover role de usuário
    list-users                    - Listar usuários e roles
    user-details <user>           - Detalhes do usuário
    list-by-role <role>           - Usuários por role

Exemplos de uso:
  node backoffice-manager.js setup
  node backoffice-manager.js status
  node backoffice-manager.js role add "Editor" "Editor de conteúdo"
  node backoffice-manager.js menu add "blog" "/blog"
  node backoffice-manager.js link link "Editor" "blog,dashboard"
  node backoffice-manager.js user assign "editor@example.com" "Editor"
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

module.exports = {
    setupDefaultRolesAndMenus,
    showSystemStatus
};
