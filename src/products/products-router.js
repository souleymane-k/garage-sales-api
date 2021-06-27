const express = require('express')
const ProductsService = require('./products-service')
const { requireAuth } = require('../middleware/jwt-auth')


const productsRouter = express.Router()
const jsonParser = express.json()


const serializeProduct = product => ({
  id: product.id,
  product_name: product.product_name,
  product_price:product.product_price,
  date_posted: product.date_posted,
  userid: product.userid,
  description: product.description,
  
})

productsRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    const knexInstance = req.app.get('db')
    ProductsService.getAllProducts(knexInstance, req.user.id)
      .then(products => {
        res.json(products.map(serializeProduct))
      })
      .catch(next)
  })
  .post(jsonParser, requireAuth, (req, res, next) => {
    const {product_name, product_price,date_posted,description} = req.body
    const newProduct = { product_name, product_price,date_posted,description }
    //month_id, userid,
    for (const [key, value] of Object.entries(newProduct))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })


    newProduct.userid = req.user.id;

// .get(requireAuth, (req, res, next)
    ProductsService.insertProduct(
      req.app.get('db'),
      newProduct
    )
      .then(product => {
        res
          .status(201)
          // .location(path.posix.join(req.originalUrl, `/${product.id}`))
          .json(serializeProduct(product))
      })
      .catch(next)
  })

productsRouter
  .route('/:product_id')
  .all((req, res, next) => {
    ProductsService.getById(
      req.app.get('db'),
      req.params.product_id
    )
      .then(product => {
        if (!product) {
          return res.status(404).json({
            error: { message: `Product doesn't exist` }
          })
        }
        res.product = product
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeProduct(res.product))
  })
  .delete((req, res, next) => {
    ProductsService.deleteProduct(
      req.app.get('db'),
      req.params.product_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { product_name, product_price,date_posted,description } = req.body
    const productToUpdate = {product_name, product_price,date_posted,description }

    const numberOfValues = Object.values(productToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          // message: `Request body must contain either 'content' or 'modified'`
          message: `Request body must contain 'product_name, product_price,date_posted,description'`
        }
      })

    ProductsService.updateProduct(
      req.app.get('db'),
      req.params.product_id,
      productToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = productsRouter