<template>
  <div class="signup-container">
    <h1>Signup</h1>
    <form @submit.prevent="registerUser">
      <div>
        <label for="username">Username:</label>
        <input id="username" v-model="userDetails.username" type="text" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input id="password" v-model="userDetails.password" type="password" required>
      </div>
      <button type="submit">Signup</button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const userDetails = ref({
      username: '',
      password: ''
    });

    const registerUser = async () => {
      try {
        const response = await fetch('http://localhost:3030/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userDetails.value)
        });

        if (!response.ok) {
          throw new Error('Signup failed');
        }

        console.log('Signup successful'); // Log a success message

        // You might want to automatically log the user in after signup
        // Or redirect them to the login page to login manually
        router.push({ name: 'login' });

        // You might want to automatically log the user in after signup
        // Or redirect them to the login page to login manually
        router.push({ name: 'login' });
      } catch (error) {
        console.error(error);
        // Handle signup error (e.g., show an error message)
      }
    };

    return {
      userDetails,
      registerUser
    };
  }
};
</script>

<style scoped>
.signup-container {
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