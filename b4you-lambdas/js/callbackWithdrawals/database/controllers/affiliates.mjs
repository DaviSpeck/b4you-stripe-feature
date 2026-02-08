import { Affiliates } from '../models/Affiliates.mjs';

export const findOneAffiliate = async (where) => {
  const affiliate = await Affiliates.findOne({
    raw: true,
    nest: true,
    where,
    include: [
      {
        association: 'product',
        include: [
          { association: 'affiliate_settings' },
          {
            association: 'producer',
          },
        ],
      },
      {
        association: 'user',
      },
    ],
  });
  return affiliate;
};
