'use strict';
/* globals supertest */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const AuthService = require('../src/auth/auth-service');

describe('Auth Endpoints', function() {
  let db;
  let testUsers = helpers.testUsers();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });



  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))





  describe('POST /api/auth/login', () => {
    const requiredFields = ['username', 'password'];
    requiredFields.forEach(field => {
      it(`returns 400 and message when ${field} is missing`, () => {
        const requestBody = {username: testUser.username, password: testUser.password};
        delete requestBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .set('Content-Type', 'application/json')
          .send(requestBody)
          .expect(400, {message: 'username and password required'});
      });
    });
     //`returns 400 and message when ${field} is missing`
    it('return 401 when invalid username', () => {
      const requestBody = {username: 'Jane Smith', password: testUser.password};
      console.log(requestBody)
      return supertest(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(requestBody)
        .expect(401, {message: 'invalid username or password'});
    });
//.set('Authorization', `Bearer ${helpers.createAuthToken(testUser)}`)
    it('return 401 when invalid password', () => {
      const requestBody = {email: testUser.email, password: 'justPlainWrong'};

      return supertest(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(requestBody)
        .expect(401, {message: 'invalid username or password'});
    });

    it('return 200, authToken and user when successful', async () => {
      const user = await helpers.findByUsername(db, testUser.username);
      const requestBody = {username: testUser.username, password: testUser.password};
      const expectedToken = AuthService.createJwt(testUser.username, {user_id: user.id});

      return supertest(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(requestBody)
        .expect(200)
        .then(res => {
          expect(res.body.authToken).to.equal(expectedToken);
          expect(res.body.user.id).to.equal(user.id);
          expect(res.body.user.username).to.equal(user.username);
          // eslint-disable-next-line no-unused-expressions
          expect(res.body.user.password).to.be.undefined;
        });
    });
  });


  describe('GET /api/auth/current-user', () => {
    it('returns 200 and user with password, created_at and updated_at removed', () => {
      return supertest(app)
        .get('/api/auth/current-user')
        .set('Authorization', helpers.createAuthToken(testUser))
        .expect(200)
        .then(res => {
          expect(res.body.id).to.equal(1);
          expect(res.body.username).to.equal(testUser.username);
          // eslint-disable-next-line no-unused-expressions
          expect(res.body.password).to.be.undefined;
          // eslint-disable-next-line no-unused-expressions
          expect(res.body.hasCurrentProduct).to.be.false;
        });
    });
  });
});