import { nanoid } from 'nanoid';
import { v4 as uuidv4, validate } from 'uuid';

const uuidHelper = (uuidProvider) => ({
    v4: () => uuidProvider(),
    validate: (uuid) => validate(uuid),
    nanoid: (size = 21) => nanoid(size),
});

export const uuid = uuidHelper(uuidv4);
