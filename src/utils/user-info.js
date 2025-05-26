import { encrypt, decrypt } from './sm4'

const key = 'lpzni56lw996p19x';

const session = sessionStorage
const session_key = 'user_info'

export const setUserInfo = (value) => {
    session.setItem(session_key, encrypt(value, key))
}

export const getUserInfo = () => {
    const value = session.getItem(session_key)
    return value != null && value != 'null'?JSON.parse(decrypt(value, key)):{}
}