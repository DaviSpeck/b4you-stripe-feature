import { createContext, useContext, useState } from 'react';

export const CollaboratorContext = createContext();
export const useCollaborator = () => useContext(CollaboratorContext);

const CollaboratorProvider = (props) => {
  const [collaborator, setCollaborator] = useState(null);

  return (
    <CollaboratorContext.Provider
      value={{ collaborator, setCollaborator }}
      {...props}
    />
  );
};

export default CollaboratorProvider;
