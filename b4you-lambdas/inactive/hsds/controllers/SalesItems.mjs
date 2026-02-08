import {
  findSalesProductsPaginated,
  updateSales,
} from '../database/controllers/SalesItems.mjs';

export const getSalesController = async ({
  id_user,
  query: {
    page = 0,
    limit = 10,
    order_id = null,
    updated_at_min,
    updated_at_max,
  },
}) => {
  try {
    const sales = await findSalesProductsPaginated({
      id_user,
      page,
      size: limit,
      order_id,
      updated_at_start: updated_at_min,
      updated_at_end: updated_at_max,
    });

    return {
      success: true,
      message_cn: '查詢成功完成',
      message_en: 'Query completed successfully',
      count: sales.count,
      rows: sales.rows.map(
        ({ product: { id, id_nano, ...rest_product }, ...props }) => ({
          ...props,
          product: {
            ...rest_product,
            uuid: id_nano,
          },
        })
      ),
    };
  } catch (error) {
    return error;
  }
};

export const updateSaleController = async ({ id_user, fulfillments }) => {
  try {
    const sale = await updateSales(id_user, fulfillments);
    return {
      success: true,
      message_cn: '訂單更新成功',
      message_en: 'Order updated successfully',
      sale,
    };
  } catch (error) {
    return error;
  }
};
