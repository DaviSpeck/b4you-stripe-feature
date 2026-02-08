
const calculatePercentage = (event) => {
  event.conversion_rate_checkout =
    (event.sales_paid / event.page_load_checkout) * 100;
  event.conversion_rate_upsell =
    (event.sales_paid_upsell / event.page_load_upsell) * 100;
  event.total_sales = event.sales_paid + event.sales_unpaid;
  event.total_sales_upsell = event.sales_paid_upsell + event.sales_unpaid_upsell;
  event.total_sales_rate = (event.total_sales / event.page_load_checkout) * 100;
  event.abandonment_rate_checkout =
    100 - (event.button_click_checkout / event.page_load_checkout) * 100;
  event.abandonment_rate_upsell =
    100 - (event.button_click_upsell / event.page_load_upsell) * 100;
    event.total_abandonment_rate = (event.abandonment_rate_checkout +  event.abandonment_rate_upsell)/2;
event.total_rate_upsell=(event.total_sales_upsell*event.sales_paid_upsell)/100;
event.total_rate_converion_upsell=(event.page_load_upsell/event.page_load_checkout)*100;
  return event;
};

const serializeSingleProduct = (events) => {
  const event = events[0];

  return calculatePercentage(event);
};


const serializeEventList = (events) => {
  const stats = events.reduce(
    (acc, event) => {
      acc.page_load_checkout += event.page_load_checkout;
      acc.button_click_checkout += event.button_click_checkout;
      acc.sales_paid += event.sales_paid;
      acc.sales_unpaid += event.sales_unpaid;
      acc.page_load_upsell += event.page_load_upsell;
      acc.button_click_upsell += event.button_click_upsell;
      acc.sales_paid_upsell += event.sales_paid_upsell;
      acc.sales_unpaid_upsell += event.sales_unpaid_upsell;
      return acc;
    },
    {
      page_load_checkout: 0,
      button_click_checkout: 0,
      sales_paid: 0,
      sales_unpaid: 0,
      page_load_upsell: 0,
      button_click_upsell: 0,
      sales_paid_upsell: 0,
      sales_unpaid_upsell: 0,
    },
  );

  return {
    stats: calculatePercentage(stats),
    events,
  };
};

module.exports = {
  serializeEventList,
  serializeSingleProduct,
};