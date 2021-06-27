const ProductsService = {
    getAllProducts(knex, userid) {
      return knex.select('*').from('garages_products')
      .where({userid})
    },
  
    insertProduct(knex, newProduct) {
      return knex
        .insert(newProduct)
        .into('garages_products')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('garages_products')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deleteProduct(knex, id) {
      return knex('garages_products')
        .where({id})
        .delete()
    },
  
    updateProduct(knex, id, newProductFields) {
      return knex('garages_products')
        .where({ id })
        .update(newProductFields)
    },
  }
  
  module.exports = ProductsService