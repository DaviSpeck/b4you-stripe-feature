const getMembershipPageLayoutUseCase = require('../../useCases/dashboard/getMembershipPageLayout');
const updateMembershipPageLayoutUseCase = require('../../useCases/dashboard/updateMembershipPageLayout');
const resetMembershipPageLayoutUseCase = require('../../useCases/dashboard/resetMembershipPageLayout');

const getMembershipPageLayout = async (req, res, next) => {
  try {
    const { uuidProduct } = req.params;
    const { user } = req;

    const layout = await getMembershipPageLayoutUseCase({
      uuidProduct,
      idUser: user.id,
    });

    return res.status(200).json(layout);
  } catch (err) {
    return next(err);
  }
};

const updateMembershipPageLayout = async (req, res, next) => {
  try {
    const { uuidProduct } = req.params;
    const { user } = req;
    const { layout } = req.body;

    const updatedLayout = await updateMembershipPageLayoutUseCase({
      uuidProduct,
      idUser: user.id,
      layout,
    });

    return res.status(200).json(updatedLayout);
  } catch (err) {
    return next(err);
  }
};

const resetMembershipPageLayout = async (req, res, next) => {
  try {
    const { uuidProduct } = req.params;
    const { user } = req;

    const defaultLayout = await resetMembershipPageLayoutUseCase({
      uuidProduct,
      idUser: user.id,
    });

    return res.status(200).json(defaultLayout);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getMembershipPageLayout,
  updateMembershipPageLayout,
  resetMembershipPageLayout,
};

