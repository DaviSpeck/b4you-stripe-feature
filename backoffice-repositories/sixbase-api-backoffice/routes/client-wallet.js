const express = require('express');
const {
  getManagers,
  getRevenue,
  getCommission,
  updateManagerCommission,
  getClients,
  getClientsCards,
  getActiveClients,
  getNewClients,
  getProducers,
  getProducersList,
  getProducersSummary,
  getCalendar,
  getChurnCard,
  getChurnList,
  getRetentionCard,
  getRetentionList,
  getRevenueChart,
  getContactStatusSummary,
  getProducersWithoutManagerCard,
  getProducersWithoutManagerList,
  assignManagerToProducer,
  getClientsWithManagerCard,
  getClientsWithManagerList,
} = require('../controllers/managers');

const {
  getSingleProducerStage,
  getProducersPerformance,
  getProducersSummary: getMonitoringSummary,
  getProducersKanban,
  getProducersKanbanAll,
  getProducersOverview,
  updateContactStatus,
} = require('../controllers/monitoring');

const {
  getManagementKanban,
  getManagementKanbanAll,
  updateManagerPhase,
  getManagementTable,
  addClientToNovosClientes,
  checkUsersInWallet,
  getSingleUserManagementData,
} = require('../controllers/management');

const router = express.Router();

router.get('/managers', getManagers);
router.get('/revenue', getRevenue);
router.get('/commission', getCommission);
router.put('/managers/:id/commission', updateManagerCommission);
router.get('/revenue/chart', getRevenueChart);
router.get('/clients', getClients);
router.get('/clients/cards', getClientsCards);
router.get('/clients/active', getActiveClients);
router.get('/clients/new', getNewClients);
router.get('/producer/stage/:id', getSingleProducerStage);
router.get('/producers', getProducers);
router.get('/producers/list', getProducersList);
router.get('/producers/summary', getProducersSummary);
router.get('/calendar', getCalendar);

router.get('/producers/performance', getProducersPerformance);
router.get('/producers/summary/monitoring', getMonitoringSummary);
router.get('/producers/overview', getProducersOverview);
router.get('/producers/kanban', getProducersKanban);
router.get('/producers/kanban/all', getProducersKanbanAll);
router.post('/producers/contact-status', updateContactStatus);

router.get('/management/kanban', getManagementKanban);
router.get('/management/kanban/all', getManagementKanbanAll);
router.post('/management/phase', updateManagerPhase);
router.get('/management/table', getManagementTable);
router.post('/management/add-client', addClientToNovosClientes);
router.post('/management/check-users-in-wallet', checkUsersInWallet);
router.get('/management/user/:id', getSingleUserManagementData);

router.get('/churn/card', getChurnCard);
router.get('/churn/list', getChurnList);

router.get('/retention/card', getRetentionCard);
router.get('/retention/list', getRetentionList);
router.get('/contact-status/summary', getContactStatusSummary);
router.get('/producers-without-manager/card', getProducersWithoutManagerCard);
router.get('/producers-without-manager/list', getProducersWithoutManagerList);
router.post('/producers-without-manager/assign', assignManagerToProducer);

router.get('/clients-with-manager/card', getClientsWithManagerCard);
router.get('/clients-with-manager/list', getClientsWithManagerList);

module.exports = router;
