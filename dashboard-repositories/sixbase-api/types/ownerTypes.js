const ownerTypes = [
    { id: 1, label: 'Produtor', key: 'producer' },
    { id: 2, label: 'Coprodutor', key: 'coproducer' },
    { id: 3, label: 'Afiliado', key: 'affiliate' },
    { id: 4, label: 'Global', key: 'global' },
];

const findOwnerType = (value) => {
    if (!value) throw new Error('owner type must be provided');
    const parameter = typeof value === 'string' ? 'key' : 'id';
    return ownerTypes.find((t) => t[parameter] === value);
};

module.exports = { ownerTypes, findOwnerType };