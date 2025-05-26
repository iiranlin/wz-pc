import Cookies from 'js-cookie'
const TokenKey = 'TokenKey';
const expires = {
	expires: new Date(new Date().getTime() + 1000 * 60 *60 * 24 *30)
}

export function getToken() {
	return window.localStorage.getItem(TokenKey)
}

export function setToken(token) {
	return window.localStorage.setItem(TokenKey, token)
}

export function removeToken(name) {
	return window.localStorage.removeItem(TokenKey);
}


export function setCookie(name, value) {
	return Cookies.set(name, value, expires)
}

export function getCookie(name) {
	return Cookies.get(name)
}

export function removeCookie(name) {
	return Cookies.remove(name)
}


export const uploadHeaders = () => {
	return {
		'Authorization': getToken()
	}
};
