import express, { Request, Response, NextFunction } from 'express';
import * as backofficeFormsController from '../controllers/backofficeForms';
import backofficeUsersController from '../controllers/backofficeUsers';
import backofficeRolesController from '../controllers/backofficeRoles';
import backofficeMenusController from '../controllers/backofficeMenus';
import backofficeActionsController from '../controllers/backofficeActions';
import backofficeLogsController from '../controllers/backofficeLogs';

const router = express.Router();

interface AuthUser {
  role?: string;
  is_admin?: boolean;
  is_marketing?: boolean;
}

const extractUser = (req: Request): AuthUser | null => {
  return (req as any).user ?? null;
};

const deny = (res: Response, status: number, message: string): void => {
  res.status(status).json({ success: false, message });
};

const checkAdminRole = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const user = extractUser(req);

    if (!user) {
      deny(res, 401, 'Não autenticado');
      return;
    }

    const isMaster = user.role === 'MASTER';
    const isAdmin = user.is_admin === true;

    if (!isMaster && !isAdmin) {
      deny(
        res,
        403,
        'Acesso negado. Apenas administradores podem acessar esta funcionalidade.',
      );
      return;
    }

    next();
  } catch (err) {
    console.error('checkAdminRole - Erro:', err);
    deny(res, 500, 'Erro ao verificar permissões');
    return;
  }
};

/* -------------------------------------------------------------------------- */
/*                          📄 Rotas públicas (Forms)                         */
/* -------------------------------------------------------------------------- */

router.get('/forms', backofficeFormsController.listForms);
router.get('/forms/:id', backofficeFormsController.getFormById);
router.get('/forms/:id/logs', backofficeFormsController.getFormLogs);

router.post('/forms', backofficeFormsController.createFormDraft);
router.put('/forms/:id', backofficeFormsController.updateFormMetadata);
router.delete('/forms/:id', backofficeFormsController.deleteForm);

router.post('/forms/:id/questions', backofficeFormsController.createQuestion);
router.put('/forms/questions/:id', backofficeFormsController.updateQuestion);
router.delete('/forms/questions/:id', backofficeFormsController.deactivateQuestion);

router.post('/forms/:id/publish', backofficeFormsController.publishFormVersion);
router.post('/forms/:id/reorder', backofficeFormsController.reorderQuestions);

router.post('/forms/seed-v1', backofficeFormsController.triggerV1Generation);

/* -------------------------------------------------------------------------- */
/*                        🔐 Rotas protegidas (Admin)                         */
/* -------------------------------------------------------------------------- */

router.use(checkAdminRole);

/* ---------------------------- 👤 Backoffice Users ---------------------------- */
router.get('/users', backofficeUsersController.listUsers);
router.post('/users', backofficeUsersController.createUser);
router.get('/users/default-password', backofficeUsersController.getDefaultPassword);
router.patch('/users/:id/role', backofficeUsersController.updateUserRole);
router.patch('/users/:id/status', backofficeUsersController.updateUserStatus);

router.get('/roles', backofficeRolesController.listRoles);
router.post('/roles', backofficeRolesController.createRole);
router.patch('/roles/:id', backofficeRolesController.updateRole);
router.delete('/roles/:id', backofficeRolesController.deleteRole);
router.patch('/roles/:id/menus', backofficeRolesController.updateRoleMenus);
router.patch('/roles/:id/actions', backofficeRolesController.updateRoleActions);

router.get('/menus', backofficeMenusController.listMenus);
router.post('/menus', backofficeMenusController.createMenu);
router.patch('/menus/:id', backofficeMenusController.updateMenu);
router.delete('/menus/:id', backofficeMenusController.deleteMenu);

router.get('/actions', backofficeActionsController.list);
router.post('/actions', backofficeActionsController.create);
router.patch('/actions/:id', backofficeActionsController.update);
router.delete('/actions/:id', backofficeActionsController.remove);
router.get('/actions/:id/roles', backofficeActionsController.getRoles);
router.post('/actions/link-roles', backofficeActionsController.linkRoles);

router.get('/logs', backofficeLogsController.listLogs);
router.get('/logs/event-types', backofficeLogsController.getEventTypes);

export = router;