/**
 * SAMPLE JWT SERVICE FOR DEV PURPOSES ONLY. NOT FOR PRODUCTION USE.
 */
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const port = process.env.SERVER_PORT || 80;
const privateKey = fs.readFileSync('./certs/jwt_priv.pem', 'utf8').trim();
const publicKey = fs.readFileSync('./certs/jwt_pub.pem', 'utf8').trim();
const users = {
  user1: {
    password: 'password1',
    userId: '12345',
    roles: ['admin', 'librarian', 'user'],
    organizations: ['central-library'],
  },
  user2: {
    password: 'password2',
    userId: '12346',
    roles: ['librarian', 'user'],
    organizations: ['central-library'],
  },
  user3: {
    password: 'password3',
    userId: '12347',
    roles: ['user'],
    organizations: [],
  },
  'apickerin0@51.la': {
    password: 'password',
    userId: '5c33c3e9e7bbb6886d531342',
    roles: ['user'],
    organizations: [],
  },
};

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

function logout(req, res) {
  // Logic to invalidate any user session caching or renewal tokens would go here
  res.sendStatus(204);
}

function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    res.sendStatus(400);
    res.end();
    return;
  }
  if (!users[username] || users[username].password !== password) {
    res.sendStatus(401);
    res.end();
    return;
  }
  const { roles, organizations, userId } = users[username];
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24hr expiry
    iat: Math.floor(Date.now()),
    sub: userId,
    username,
    name: username,
    organizations,
    roles,
  };

  try {
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    res.status(201).json({
      data: token,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}

app.get('/', (req, res) => res.send('JWT Service'));
app.get('/publickey', (req, res) => {
  res.contentType('text/plain');
  res.send(publicKey);
  res.end();
});
app.post('/login', login);
app.post('/logout', logout);
app.listen(port);
