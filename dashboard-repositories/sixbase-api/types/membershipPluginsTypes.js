const membershipPluginsTypes = [
  {
    id: 1,
    key: 'jivo-chat',
    label: 'Jivo Chat',
  },
  {
    id: 2,
    key: 'whatsapp',
    label: 'Whatsapp',
  },
];

/**
 * @param param {String | number}
 */
const findMembershipPluginType = (param) => {
  if (!param) throw new Error('param must be provided');
  if (typeof param === 'string') {
    return membershipPluginsTypes.find(({ key }) => key === param);
  }

  return membershipPluginsTypes.find(({ id }) => id === param);
};

module.exports = {
  findMembershipPluginType,
  membershipPluginsTypes,
};
