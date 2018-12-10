db.createUser({
  user: 'graphql',
  pwd: 'graphqlpw',
  roles: [
    { role: 'readWrite', db: 'central-library' }
  ]
});