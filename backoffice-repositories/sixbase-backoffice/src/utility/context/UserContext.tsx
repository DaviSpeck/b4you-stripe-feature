import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode
} from 'react'
import axios, { AxiosInstance } from 'axios'
import { AbilityContext } from './Can'
import { handleLogin, handleLogout } from 'redux/authentication'
import { useAppDispatch, useAppSelector } from 'redux/hooks'
import { api } from 'services/api'

export interface UserAbility {
    action: string
    subject: string
}

export interface UserData {
    id: number
    name: string
    email: string
    role: string
    role_description?: string | null
    abilities: UserAbility[]
    accessToken?: string
}

interface UserContextProps {
    userData: UserData | null
    loading: boolean
    revalidateUser: () => Promise<void>
    logout: () => void
}

export const UserContext = createContext<UserContextProps>({
    userData: null,
    loading: true,
    revalidateUser: async () => { },
    logout: () => { }
})

interface UserProviderProps {
    children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const ability = useContext(AbilityContext)
    const dispatch = useAppDispatch()
    const storeUser = useAppSelector((state) => state.auth.userData)

    const [userData, setUserData] = useState<UserData | null>(
        storeUser && Object.keys(storeUser).length > 0 ? storeUser : null
    )
    const [loading, setLoading] = useState(true)

    const revalidateUser = async (): Promise<void> => {
        try {
            const storedToken = localStorage.getItem('accessToken')
            if (!storedToken) {
                setLoading(false)
                return
            }

            const token = JSON.parse(storedToken)
            api.defaults.headers.common.Authorization = `Bearer ${token}`

            const { data } = await api.get<{ user: UserData }>('/auth/me')
            
            const userWithToken = { ...data.user, accessToken: token }
            dispatch(handleLogin(userWithToken))
            setUserData(data.user)
            ability.update(data.user.abilities || [])
        } catch (err) {
            console.warn('[UserContext] Token inválido ou expirado', err)
            logout()
        } finally {
            setLoading(false)
        }
    }

    const logout = (): void => {
        dispatch(handleLogout())
        setUserData(null)
        ability.update([])
    }

    useEffect(() => {
        revalidateUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <UserContext.Provider value={{ userData, loading, revalidateUser, logout }}>
            {children}
        </UserContext.Provider>
    )
}
