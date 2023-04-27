let express = require('express');
let router = express.Router();
let userModel = require('../db/models/user');
let util = require('../lib/stubs/utils');
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');
const saltRounds = 10;
let myPlaintextPassword = "";
let hashedPassword = "";

/* Create a new user */
router.post('/', async function (req, res, next) {
    myPlaintextPassword = req.body.password;
    bcrypt.hash(myPlaintextPassword, saltRounds, async function(err, hash) {
        hashedPassword = hash;

        data = {
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
            role: req.body.role || 'authenticatedUser',
            is_new: req.body.is_new,
            last_login: req.body.last_login
        };
    
        try {
            let newDoc = await userModel.create(data);
    
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

});


// /* Fetch user by email and password */
router.get('/userByEmail', async function (req, res, next) {
    let email = util.getValueByName(req, 'email');
    let password = util.getValueByName(req, 'password');

    try {
        let user = await userModel.findOne({ email: email });

        if (!user) {
            try {
                throw new Error('Invalid Email');
            } catch (er) {
                return next(er)
            }
        } else {
            bcrypt.compare(password, user.password, function(err, result) {
                if(result == true || password == user.password) {
                    let payload = { subject: user._id };
                    let token = jwt.sign(payload, 'secretKey')
                    res.status(200).send({token, user})
                } else {
                    try {
                        throw new Error('Invalid Password');
                    } catch (er) {
                        return next(er)
                    }
                }
            }); 
        }
    } catch (e) {
        res.status(500).send(e);
    }
});


/*check whether `id` is a part of the request body*/
router.use(async function (req, res, next) {
    let id = util.getValueByName(req, 'id');

    if (!id) {
        e = new Error();
        e.status = 400;
        e.message = "user id is required"

        return next(e);
    }
    else next();
});

// /* Fetch user by id */
router.get('/userById', async function (req, res, next) {
    let id = util.getValueByName(req, 'id');

    try {
        let user = await userModel.findOne({ id: id });
      

        if (!user) {
            try {
                throw new Error('Invalid Id');
            } catch (er) {
                return next(er)
            }
        } else {
            res.status(200).send(user);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

/* Update the user details*/
router.put('/', async function (req, res, next) {
    data = {
        id: req.body.id,
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        role: req.body.role || 'authenticatedUser',
        is_new: req.body.is_new,
        last_login: req.body.last_login
    };

    try {
        let updateDoc = await userModel.findOneAndUpdate(
            { id: req.body.id },
            { $set: data, $inc: { __v: 1 } },
            { new: true, runValidators: true }
        );

        if (!updateDoc) {
            e = new Error();
            e.status = 404;
            e.message = 'user not found';

            return next(e);
        } else {
            return res.status(200).json(updateDoc.transform());
        }
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            e = new Error();
            e.status = 409;
            e.message = "name already in use, choose a different one";
            return next(e);
        }

        return next(err);
    }
});

/* Delete a user */
router.delete('/', async function (req, res, next) {
    let id = util.getValueByName(req, 'id');

    try {
        let delDoc = await userModel.findOneAndRemove({ id: id});

        if (!delDoc) {
            e = new Error();
            e.status = 404;
            e.message = 'user not found';

            return next(e);
        } else {
            return res.status(200).json({ id: id, "deleted": true });
        }
    } catch (err) {
        return next(err);
    }

});

module.exports = router;
