//supervisor index.js
const express = require('express')
const app = express()
const port = 8000

const Sequelize = require('sequelize');


const sequelize = new Sequelize('lualog', 'root', 'wszgr', {
  host: 'localhost',
  dialect: 'mysql', /* 'mysql' | 'mariadb' | 'postgres' | 'mssql' 之一 */
  port:3306,
  //logQueryParameters:false,
  timestamps: false,
  //logging = false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

sequelize.authenticate()
.then(() => {
console.log('Connection has been established successfully.');
})
.catch(err => {
console.error('Unable to connect to the database:', err);
});

const lualog = sequelize.define('log', {
  idx: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  time: {
    type: Sequelize.STRING
  },
  data: {
    type: Sequelize.STRING
  },
  ect: {
    type: Sequelize.STRING
  }
},{
  tableName: 'log',
  timestamps: false,
})





app.get('/', function (req, res) {
	
  res.send('Hello World!')
})

app.get('/lualog/:id', async function (req, res, next) {
 //console.log(req.params.id)
 let ress =await lualog.findAll({ limit: parseInt(req.params.id) });
 await res.json(ress);
})

app.use('/public', express.static('public'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
