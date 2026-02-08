import { findUserProductsPaginated } from '../database/controllers/Products.mjs';
import { convertNanoToId } from '../utils/common.mjs';

export const getProductsController = async ({
  id_user,
  query: {
    page = 0,
    limit = 10,
    product_id = null,
    updated_at_min,
    updated_at_max,
  },
}) => {
  try {
    const products = await findUserProductsPaginated({
      id_user,
      page,
      size: limit,
      product_id: product_id ? convertNanoToId(product_id) : null,
      updated_at_min,
      updated_at_max,
    });
    const response = products.rows.map((element) => element.toJSON());
    return {
      success: true,
      message_cn: '查詢成功完成',
      message_en: 'Query completed successfully',
      count: products.count,
      rows: response.map(({ id, id_nano, ...rest }) => ({
        ...rest,
        uuid: id_nano,
      })),
    };
  } catch (error) {
    return error;
  }
};
