/**
 * file: db/mongoConnect.js
 * author: Lohith Reddy Kalluru
 * description:
 *      Connect to the Mongo Database and expose the connection from here
 */

 let mongoose = require('mongoose');
 let config = require('../config')
 let dbConfig = config.database.default;
 
 let dbConn = null;
 let mongoOptions = {
     useNewUrlParser: true,
     useUnifiedTopology: true
 };
 
 if (dbConfig.user === null && dbConfig.password === null) {
     dbConn = mongoose.createConnection(
         `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`,
         mongoOptions
     );
 } else {
     dbConn = mongoose.createConnection(
         `mongodb://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`,
         mongoOptions
     );
 }


 
 dbConn.on('error', console.error.bind(console, 'connection error:'));
 
 module.exports = dbConn;