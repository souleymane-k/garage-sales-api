require("dotenv").config();
const knex=require('knex');
const app =require('./app');
const pg = require('pg');


const { PORT, DATABASE_URL } = require('./config')
const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
  })

app.set("db", db);

app.listen(PORT,() =>{
  console.log(`server listening at http://localhost:${PORT} ${DATABASE_URL}`);
})