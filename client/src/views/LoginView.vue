<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="loginUser">
      <div>
        <label for="username">Username:</label>
        <input id="username" v-model="loginDetails.username" type="text" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input id="password" v-model="loginDetails.password" type="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    <div>Don't have an account? <router-link to="/signup">Sign up</router-link></div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser as storeLoginUser } from '../stores/userStore'; 

export default {
  setup() {
    const router = useRouter();
    const loginDetails = ref({
      username: '',
      password: ''
    });

    const performLogin = async () => {
      const credentials = { username: loginDetails.value.username, password: loginDetails.value.password };

      try {
        const response = await fetch('http://localhost:3030/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        // Assuming the backend sends back a username in the response, for example:
        // { "username": "user123", "token": "..." }

        // On succesful login, store username and other necessary info in localStorage
        storeLoginUser(data.username); // This updates the store with the username
        localStorage.setItem('username', data.username);
        localStorage.setItem('token', data.token);
        localStorage.setItem('isLoggedIn', 'true');

        router.push({ name: 'home' });
      } catch (error) {
        console.error(error);
      }
    };

    return {
      loginDetails,
      loginUser: performLogin
    };
  }
};
</script>

<style scoped>
.login-container {
  max-width: 300px;
  margin: auto;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
}

input {
  width: 100%;
  padding: 8px;
  margin-bottom: 20px;
}

button {
  width: 100%;
  padding: 8px;
}
</style>
