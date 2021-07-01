const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers');

describe('Prodcuts Endpoints', () => {
    let db
    let testUsers = helpers.testUsers();
    const testUser = testUsers[0];
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db)
    })
  

    after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE garages_products, Garages_users RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE garages_products, Garages_users RESTART IDENTITY CASCADE'))

    describe('GET /api/products', () => {
      context(`Given no products`, () => {
        it(`responds with 401 and an empty list`, () => {
          return supertest(app)
            .get('/api/products')
            .set('Authorization', `Bearer ${helpers.createAuthToken(testUser)}`)
            .expect(401)
        })
      })
  
    describe('GET /api/products/:product_id', () => {
      context(`Given no products`, () => {
        it(`responds 404 Produc doesn't exist`, () => {
          return supertest(app)
            .get(`/api/products/123`)
            .set('Authorization', `Bearer ${helpers.createAuthToken(testUser)}`)
            .expect(404, {
              error: { message: `Product doesn't exist` }
            })
        })
      })
    })
    describe('DELETE /api/products/:product_id', () => {
      context(`Given no products`, () => {
        it(`responds 404 Product doesn't exist`, () => {
          return supertest(app)
            .delete(`/api/products/123`)
            .set('Authorization', `Bearer ${helpers.createAuthToken(testUser)}`)
            .expect(404, {
              error: { message: `Product doesn't exist` }
            })
        })
      })

      context('Given there are products in the database', () => {
        const product = {
          product_name: 'test-name',
          product_price: $111,
          date_posted: Date,
          userid: 1,
          description: 'test-description'
        }

        beforeEach('insert products', () => {
          return db
            .into('garages_products')
            .insert(product)
        })
  
        it('removes the product by ID from the database', () => {
          const idToRemove = 2
          const expectedProducts = testProducts.filter(bm => bm.id !== idToRemove)
          return supertest(app)
            .delete(`/api/products/${idToRemove}`)
            .set('Authorization', `Bearer ${helpers.createAuthToken(testUser)}`)
            .expect(204)
            .then(() =>
              supertest(app)
                .get(`/api/products`)
                .set('Authorization', `Bearer ${helpers.createAuthToken(testUser)}`)
                .expect(expectedProducts)
            )
        })
      })
    })
  
    describe('POST /api/products', () => {
      ['product_name','product_price','date_posted','userid','description'].forEach(field => {
        const newProduct = {
          product_name: 'test-name',
          product_price: $111,
          date_posted: Date,
          userid: 1,
          description: 'test-description' 
        }
  
        it(`responds with 400 missing '${field}' if not supplied`, () => {
          delete newProduct[field]
          
          return supertest(app)
            .post(`/api/products`)
            .send(newProduct)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(400, {

              error: { message: `Missing '${field}' in request body` }
            })
        })
      })
  
      it('adds a new product to the database', () => {
        const newProduct = {
          product_name: 'test-name',
          product_price: $111,
          date_posted: Date,
          userid: 1,
          description: 'test-description' 
          
        }
        return supertest(app)
          .post(`/api/products`)
          .send(newProduct)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id')
            expect(res.body.product_name).to.eql(newProduct.product_name)
            expect(res.body.product_price).to.eql(newProduct.product_price)
            expect(res.body.date_posted).to.eql(newProduct.date_posted)
            expect(res.body.userid).to.eql(newProduct.userid)
            expect(res.body.description).to.eql(newProduct.description)
            expect(res.headers.location).to.eql(`/api/products/${res.body.id}`)
          })
          .then(res =>
            supertest(app)
              .get(`/api/products/${res.body.id}`)
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(res.body)
          )
      })
    })
    // ${res.body.id}`)
    describe(`PATCH /api/products/:product_id`, () => {
      context(`Given no products`, () => {
        it(`responds with 404`, () => {
          const productId = 123456
          return supertest(app)
            .patch(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(404, { error: { message: `Product doesn't exist` } })
        })
      })
      })
    })
  })