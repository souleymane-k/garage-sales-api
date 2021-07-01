const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ProductsService = require('../src/products/products-service');
function cleanTables(db) {
  return db.raw(
    `TRUNCATE garages_products, garagess_users RESTART IDENTITY CASCADE`
  );
}

function createAuthToken(user, secret=process.env.JWT_SECRET, expiry=process.env.JWT_EXPIRY) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    expiresIn: expiry,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}


function createNewUserRequest() {
  return {
    username: 'foo bar',
    email: 'foo@bar.com',
    password: '123456',
    
  };
}

function testUsers() {
  return [
    {
      username: 'John Doe',
      email: 'foo@bar.com',
      password: 'foobar123'
    },
    {
      username: 'Jane Smith',
      email: 'foo@baz.com',
      password: 'foobaz123'
    }
  ];
}

function createUsers(db, users) {
  const preppedUsers = users.map(user => {
    return {...user, password: bcrypt.hashSync(user.password, 1)};
  });

  return db('users')
    .insert(preppedUsers)
    .returning('*')
    .then(rows => rows);
}

function findByUsername(db, username) {
  return db('users').where({username}).first('*');
}

async function createProducts(db, product_id) {
  const products = await ProductsService.createProducts(product_id);
  return db('garages_products')
    .insert(products)
    .returning('*')
    .then(rows => rows);
}

function findProductById(db, id) {
  return db('garages_product').where({id}).first('*');
}


module.exports = {
  cleanTables,
  createAuthToken,
  createNewUserRequest,
  createUsers,
  testUsers,
  findByUsername,
  createProducts,
  findProductById,
};