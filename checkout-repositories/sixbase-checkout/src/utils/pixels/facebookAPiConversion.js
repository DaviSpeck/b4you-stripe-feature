import api from 'api';
import { nanoid } from 'nanoid';
/**
 * @param {string} event
 * @param {string} pixel_uuid,
 * @param {Object} data
 */
export const sendApiEvent = async (
  event,
  pixel_uuid,
  data,
  method = 'card'
) => {
  try {
    await api.post(`/cart/pixel`, {
      custom_data: data,
      event_id: nanoid(),
      event_name: event,
      pixel_uuid,
      method,
    });
  } catch (error) {}
};
