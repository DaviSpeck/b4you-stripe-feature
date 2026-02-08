import { createContext } from 'react'
import { Ability } from '@casl/ability'
import { createContextualCan } from '@casl/react'

// ** Instância global da Ability
export const ability = new Ability([])

// ** Contexto compartilhado da Ability
export const AbilityContext = createContext(ability)

// ** Componente utilitário para checagens diretas em JSX
export const Can = createContextualCan(AbilityContext.Consumer)