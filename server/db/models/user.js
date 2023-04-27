/**
 * @author Lohith Reddy Kalluru
 * @email 
 * @create date 2022-05-05 09:42:49
 * @modify date 2022-05-05 09:42:49
 * @desc   All the operations on the projects will be exposed from here
 *      For reference visit https://mongoosejs.com/docs/guide.html
 */


let mongoose = require('mongoose');
let uuid = require('uuid');
let async = require('async');
let db = require('../mongoConnect');
let config = require('../../config');
let Schema = mongoose.Schema;

const projectionsDefaults = { _id: 0, __v: 0 };
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

let userSchema = Schema({
    id: {
        type: String,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, "required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "required"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "required"],
        trim: true
    },
    is_new: {
        type: Boolean
    },
    last_login: {
        type: Date
    }
}, {
    collection: config.collections.users
});

userSchema.set('timestamps', true);

userSchema.pre('save', function (next) {
    let obj = this;

    if (this._update && this._update['$set']){
        obj = this._update['$set'];
    }

    obj.id = obj.id || uuid();
    next();
});

userSchema.method('transform', function () {
    let obj = this.toObject();

    
    delete obj._id;
    delete obj.__v;

    return obj;
});

userSchema.statics.getUserByEmail = function (email, callback) {
    this.findOne({ email: email }, projectionsDefaults).lean().exec(function (err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            try {
                throw new Error('Invalid Email');
            } catch (er) {
                return callback(er);
            }
        }
        return callback(null, user);
    });
};

module.exports = db.model('user', userSchema);