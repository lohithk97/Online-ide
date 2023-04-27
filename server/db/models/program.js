/**
 * @author Lohith Reddy Kalluru
 * @email 
 * @create date 2022-05-05 09:42:49
 * @modify date 2022-05-05 09:42:49
 * @desc   All the operations on the projects will be exposed from here
 *      For reference visit https://mongoosejs.com/docs/guide.html
 */

let mongoose = require('mongoose');
let db = require('../mongoConnect');
let uuid = require('uuid');
let async = require('async');
let config = require('../../config')
let Schema = mongoose.Schema;

const projectionsDefaults = { _id: 0, __v: 0 };

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);



let projectSchema = Schema({
    id: {
        type: String,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, "required"],
        trim: true,
        match: config.name
    },
    description: {
        type: String,
        trim: true
    },
    language: {
        type: String,
        required: [true, "required"],
        enum: ['python', 'java']
    },
    visibility: {
        type: String,
        required: [true, "required"],
        enum: ['private', 'public']
    },
    ownerId: {
        type: String,
        required: [true, "required"],
        trim: true
    }
}, {
        collection: config.collections.projects
});


projectSchema.set('timestamps', true);

projectSchema.index({ name: 1}, { unique: [true, "variable name should be unique"] })

projectSchema.pre(['save', 'findOneAndUpdate'], function (next) {
    let obj = this;

    if (this._update && this._update["$set"]) {
      obj = this._update["$set"];
    }
  
    obj.id = obj.id || uuid();
    next();
});

projectSchema.method('transform', function () {
    let obj = this.toObject();

    delete obj._id;
    delete obj.__v;

    return obj;
});

module.exports = db.model('projects', projectSchema);