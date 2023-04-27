/**
 * @author Lohith Reddy Kalluru
 * @email 
 * @create date 2022-05-05 10:03:42
 * @modify date 2022-05-05 10:03:42
 * @desc   Exposes CRUD API's to perform operations on functions
 */



let express = require('express');
let router = express.Router();
let forgotPasswordModel = require('../db/models/forgotPassword');
let util = require('../lib/stubs/utils');
let randtoken = require('rand-token');

/* forgotPassword Operations */

/* Creating a forgot password request  */
router.post('/', async function (req, res, next) {
    data = {
        email: req.body.email,
        token: randtoken.generate(16)
    };

    try {
        let newDoc = await forgotPasswordModel.create(data);

        res.status(200).json(newDoc.transform())
    }
    catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            e = new Error();
            e.status = 409;
            e.message = "name already in use, choose a different one";
            return next(e);
        }

        return next(err);
    }
});

router.get('/validateToken', async function(req,res,next) {
    try {
        let token = util.getValueByName(req, 'token')
        let doc = await forgotPasswordModel.findOne({ token: token });

        if (!doc) {
            throw new Error('Token is not valid');
        } else {
            let time = new Date();
            let hours = (Math.abs(time - doc.createdAt) / (1000 * 60 * 60)).toFixed(1);
            if(hours < 72 || hours === 72) {
                await forgotPasswordModel.findOneAndRemove({ token: token });
                return res.status(200).json({ "valid": true, doc });
            } else {
                await forgotPasswordModel.findOneAndRemove({ token: token });
                throw new Error('Link expired');
            }
        }
    } catch (err) {
        return next(err)
    } 
})

module.exports = router;