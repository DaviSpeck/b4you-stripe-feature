const {
  FUNNEL_STEPS,
  SUCCESS_EVENT_NAMES,
  SUMMARY_ERROR_EVENTS,
  STEP_DEFINITIONS,
} = require('./journey.constants');

const DEFAULT_EVENTS_LIMIT = 10;

class JourneyService {
  constructor(repository, offerContextService) {
    this.repository = repository;
    this.offerContextService = offerContextService;
  }

  async getSummary(filters) {
    const result = await this.repository.fetchSummary(filters, {
      successEvents: SUCCESS_EVENT_NAMES,
      errorEvents: SUMMARY_ERROR_EVENTS,
    });

    return {
      total_sessions: Number(result.total_sessions || 0),
      total_events: Number(result.total_events || 0),
      success_sessions: Number(result.success_sessions || 0),
      conversion_success_sessions: Number(
        result.conversion_success_sessions || 0,
      ),
      payment_success_sessions: Number(result.payment_success_sessions || 0),
      error_sessions: Number(result.error_sessions || 0),
    };
  }

  async getFunnel(filters) {
    const rows = await this.repository.fetchFunnel(
      filters,
      FUNNEL_STEPS.map((step) => step.event_name),
    );
    const counts = new Map(
      rows.map((row) => [row.event_name, Number(row.sessions || 0)]),
    );

    return {
      steps: FUNNEL_STEPS.map((step) => ({
        event_name: step.event_name,
        label: step.label,
        sessions: counts.get(step.event_name) || 0,
      })),
    };
  }

  async getSteps(filters) {
    const row = await this.repository.fetchSteps(filters, STEP_DEFINITIONS);

    return {
      steps: STEP_DEFINITIONS.map((definition) => ({
        step: definition.step,
        started: Number(row[`${definition.step}_started`] || 0),
        completed: Number(row[`${definition.step}_completed`] || 0),
        errors: Number(row[`${definition.step}_errors`] || 0),
      })),
    };
  }

  async getPaymentMethods(filters) {
    const rows = await this.repository.fetchPaymentMethods(filters);

    return {
      items: rows.map((row) => ({
        payment_method: row.payment_method,
        sessions: Number(row.sessions || 0),
        success_sessions: Number(row.success_sessions || 0),
      })),
    };
  }

  async getDistribution(filters) {
    const { checkoutTypes, checkoutModes } =
      await this.repository.fetchDistribution(filters);

    return {
      checkout_type: checkoutTypes.map((row) => ({
        value: row.checkout_type,
        sessions: Number(row.sessions || 0),
      })),
      checkout_mode: checkoutModes.map((row) => ({
        value: row.checkout_mode,
        sessions: Number(row.sessions || 0),
      })),
    };
  }

  async getBreakdowns(filters) {
    const { checkoutTypes, checkoutModes, paymentMethods } =
      await this.repository.fetchBreakdowns(filters);

    return {
      by_checkout_type: checkoutTypes.map((row) => ({
        label: row.checkout_type,
        sessions: Number(row.sessions || 0),
        success_sessions: Number(row.success_sessions || 0),
      })),
      by_checkout_mode: checkoutModes.map((row) => ({
        label: row.checkout_mode,
        sessions: Number(row.sessions || 0),
        success_sessions: Number(row.success_sessions || 0),
      })),
      by_payment_method: paymentMethods.map((row) => ({
        label: row.payment_method,
        sessions: Number(row.sessions || 0),
        success_sessions: Number(row.success_sessions || 0),
      })),
    };
  }

  async getProducts(filters, pagination) {
    const { items } = await this.repository.fetchOfferAggregates(filters);

    const offerIds = items.map((item) => item.offer_id).filter(Boolean);
    const offerContexts =
      await this.offerContextService.getOfferContexts(offerIds);

    const aggregated = new Map();
    items.forEach((item) => {
      const context = offerContexts.get(item.offer_id) || null;
      const productId = context?.product_id || null;
      const key = productId || 'unknown-product';
      const current = aggregated.get(key) || {
        product_id: productId,
        product_name: context?.product_name || null,
        sessions: 0,
        success_sessions: 0,
      };

      current.sessions += Number(item.sessions || 0);
      current.success_sessions += Number(item.success_sessions || 0);

      aggregated.set(key, current);
    });

    const sorted = Array.from(aggregated.values()).sort(
      (a, b) => b.sessions - a.sessions,
    );
    const total = sorted.length;
    const offset = (pagination.page - 1) * pagination.page_size;
    const paginated = sorted.slice(offset, offset + pagination.page_size);

    return {
      items: paginated,
      page: pagination.page,
      page_size: pagination.page_size,
      total,
    };
  }

  async getProducers(filters, pagination) {
    const { items } = await this.repository.fetchOfferAggregates(filters);

    const offerIds = items.map((item) => item.offer_id).filter(Boolean);
    const offerContexts =
      await this.offerContextService.getOfferContexts(offerIds);

    const aggregated = new Map();
    items.forEach((item) => {
      const context = offerContexts.get(item.offer_id) || null;
      const producerId = context?.producer_id || null;
      const key = producerId || 'unknown-producer';
      const current = aggregated.get(key) || {
        producer_id: producerId,
        producer_name: context?.producer_name || null,
        sessions: 0,
        success_sessions: 0,
      };

      current.sessions += Number(item.sessions || 0);
      current.success_sessions += Number(item.success_sessions || 0);

      aggregated.set(key, current);
    });

    const sorted = Array.from(aggregated.values()).sort(
      (a, b) => b.sessions - a.sessions,
    );
    const total = sorted.length;
    const offset = (pagination.page - 1) * pagination.page_size;
    const paginated = sorted.slice(offset, offset + pagination.page_size);

    return {
      items: paginated,
      page: pagination.page,
      page_size: pagination.page_size,
      total,
    };
  }

  async getSessions(filters, pagination) {
    const { sessions, total } = await this.repository.fetchSessions(
      filters,
      pagination,
    );

    const sessionIds = sessions.map((session) => session.session_id);
    const [details, events] = await Promise.all([
      this.repository.fetchSessionDetails(filters, sessionIds),
      this.repository.fetchSessionEvents(filters, sessionIds),
    ]);

    const detailsMap = new Map(
      details.map((detail) => [detail.session_id, detail]),
    );
    const eventsMap = new Map();

    events.forEach((event) => {
      if (!eventsMap.has(event.session_id)) {
        eventsMap.set(event.session_id, []);
      }
      const list = eventsMap.get(event.session_id);
      if (list.length < DEFAULT_EVENTS_LIMIT) {
        list.push({
          event_name: event.event_name,
          event_description: event.event_description,
          event_timestamp: Number(event.event_timestamp || 0),
        });
      }
    });

    const offerIds = details
      .map((detail) => detail.offer_id)
      .filter(Boolean);
    const offerContexts = await this.offerContextService.getOfferContexts(
      offerIds,
    );

    const items = sessionIds.map((sessionId) => {
      const detail = detailsMap.get(sessionId) || {};
      const offerContext = offerContexts.get(detail.offer_id) || null;

      return {
        session_id: sessionId,
        offer_id: detail.offer_id || null,
        checkout_type: detail.checkout_type || null,
        checkout_mode: detail.checkout_mode || null,
        payment_method: detail.payment_method || null,
        events: eventsMap.get(sessionId) || [],
        offer_context: offerContext,
      };
    });

    return {
      items,
      page: pagination.page,
      page_size: pagination.page_size,
      total,
    };
  }

  async getDomains(filters, pagination) {
    const { items, total } = await this.repository.fetchDomainAggregates(
      filters,
      pagination,
    );

    return {
      items: items.map((item) => ({
        root_domain: item.full_hostname === 'unknown' ? null : item.full_hostname,
        sessions: Number(item.sessions || 0),
        success_sessions: Number(item.success_sessions || 0),
      })),
      page: pagination.page,
      page_size: pagination.page_size,
      total,
    };
  }
}

module.exports = JourneyService;
