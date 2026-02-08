const ListNotificationEvents = require('../useCases/notifications/ListNotificationEvents');
const GetNotificationEvent = require('../useCases/notifications/GetNotificationEvent');
const UpdateNotificationEvent = require('../useCases/notifications/UpdateNotificationEvent');
const NotificationEventsRepository = require('../repositories/sequelize/NotificationEventsRepository');

module.exports = {
    async list(req, res, next) {
        try {
            const useCase = new ListNotificationEvents(NotificationEventsRepository);
            return res.status(200).json(await useCase.execute());
        } catch (err) {
            next(err);
        }
    },

    async getById(req, res, next) {
        try {
            const useCase = new GetNotificationEvent(NotificationEventsRepository);
            return res.status(200).json(
                await useCase.execute(Number(req.params.id)),
            );
        } catch (err) {
            return next(err);
        }
    },

    async update(req, res, next) {
        try {
            const useCase = new UpdateNotificationEvent(NotificationEventsRepository);
            return res.status(200).json(
                await useCase.execute(Number(req.params.id), req.body),
            );
        } catch (err) {
            return next(err);
        }
    },
};