const formatAddress = ({
  street,
  number,
  neighborhood,
  city,
  state,
  zipcode,
}) => {
  const currentAddress = {};
  const defaultAddress = {
    street: null,
    number: null,
    neighborhood: null,
    city: null,
    state: null,
    zipcode: null,
  };
  if (street) defaultAddress.street = street;
  if (number) defaultAddress.number = number;
  if (neighborhood) defaultAddress.neighborhood = neighborhood;
  if (city) defaultAddress.city = city;
  if (state) defaultAddress.state = state;
  if (zipcode) defaultAddress.zipcode = zipcode;
  Object.keys(defaultAddress).forEach((key) => {
    if (defaultAddress[key] !== null) currentAddress[key] = defaultAddress[key];
  });
  return currentAddress;
};

module.exports = {
  formatAddress,
};
