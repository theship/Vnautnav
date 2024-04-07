# Initial Vue Node Express Flashcards project

After cloning, npm install in both client & server directories.

## Set up a folder with both a client & server subdirectory

> mkdir Vnautnav
> cd Vnautnav
> mkdir client server

## In the server subdir

> cd server

### initialize & install

> npm init -y
> npm install express sqlite3 csv-parser cors bcrypt jsonwebtoken dotenv

### Create a datasource csv file

server/data/nav-rule.csv in the format of id, question, answer, as in:

```
id,question,answer
0.100.001,What is the purpose of the Navigation Rules?,The Navigation Rules are designed to prevent collisions and ensure the safe navigation of vessels.
0.100.002,What do the Navigation Rules govern?,The Navigation Rules govern the conduct of vessels in any condition of visibility and prescribe the navigation lights required for vessels.
0.100.003,What is Rule 2 of the Navigation Rules?,Rule 2 states that the Rules apply to all vessels upon the high seas and waters connected therewith navigable by seagoing vessels.
.
.
.
```

### Create an app.js file here

Create an node express app that sets up the database using the data source and providing the api endpoints, as in server/app.js.

### Create a temporary JWT secret key

In the terminal, run Node.js in interactive mode by typing `node` and hitting Enter.

```
> node
```

Use the crypto module to generate a random string, like so:

```
> require('crypto').randomBytes(64).toString('hex')
```

#### Store the Secret Key Securely
For security and configurability, it's best to store your secret key outside of your application code, such as in environment variables. You can use a .env file to manage environment variables in a development environment.

Install the dotenv package to load environment variables from a .env file into process.env:

```
> npm install dotenv
```
Create a .env file in the root of your project if you haven't already.

Add your secret key to the .env file:

```
JWT_SECRET=your_generated_secret_here
```

Keep your .env file secure and ensure it's included in your .gitignore file to prevent it from being committed to version control.

Regularly rotate your secret keys and update them in your environment variables to maintain security, especially if you suspect the key has been compromised.

#### Load environment variables with dotenv

At the beginning of your app.js, add:

```
require('dotenv').config();
```

#### Use the Secret Key in Your Application

Now that your secret key is stored in an environment variable, you can use it to sign JWT tokens securely:

```
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
```

### Run backend from the server directory

```
> node app.js
Server is running on http://localhost:3000
Connected to the flashcards database.
CSV file successfully processed and data inserted into the database.
A row has been inserted with rowid 1
A row has been inserted with rowid 2
.
.
.
```

## In client directory

### Install the create-vue@3.10.2 package and create a client project

> npx create-vue@latest .

```
Vue.js - The Progressive JavaScript Framework

✔ Package name: … v-flashcards
✔ Add TypeScript? … No
✔ Add JSX Support? … No
✔ Add Vue Router for Single Page Application development? … Yes
✔ Add Pinia for state management? … Yes
✔ Add Vitest for Unit Testing? … No
✔ Add an End-to-End Testing Solution? › No
✔ Add ESLint for code quality? … No
✔ Add Vue DevTools 7 extension for debugging? (experimental) … No

Scaffolding project in .../Vnautnav/client...

Done. Now run:

  npm install
  npm run dev
```

> npm install
> npm run dev

```
v-flashcards@0.0.0 dev
vite


  VITE v5.2.7  ready in 666 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Install Tailwind CSS

> npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
> npx tailwindcss init -p

#### Add the tailwind imports before the base import

```
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* After Tailwind's styles, import your custom base styles */
@import 'base.css';
```

### Modify the Vue app

* Remove Welcome and Hello World
* Modify HomeView to use TheFlashcards component and item renderer
* Modify some CSS, including the main.css to put the header back on top
