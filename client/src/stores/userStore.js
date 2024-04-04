import { ref } from 'vue';

export const isLoggedIn = ref(false);
export const username = ref('');

export function loginUser(name) {
    isLoggedIn.value = true;
    username.value = name;
}

export function logoutUser() {
    isLoggedIn.value = false;
    username.value = '';
}
