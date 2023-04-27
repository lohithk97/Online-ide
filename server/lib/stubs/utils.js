/**
 * @author Lohith Reddy Kalluru
 * @email 
 * @create date 2022-05-05 23:05:46
 * @modify date 2022-05-05 23:05:46
 * @desc [description]
 */


let config = require('../../config');




let getValueByName = function(req, name) {
    let val = req.query[name];
    if (!val) {
        val = req.body[name];
    }

    return val;
}

let getUserId = function(req) {
    userId = req.header('X-USER-ID');
    return userId;
}

module.exports = {
    
  
    getValueByName: getValueByName,
   
    getUserId: getUserId
};