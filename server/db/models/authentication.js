/**
 * @author Lohith Reddy Kalluru
 * @email 
 * @create date 2022-05-05 09:41:41
 * @modify date 2022-05-05 09:41:41
 * @desc * All the operations on the projects will be exposed from here
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


let authenticationSchema = Schema({
	id: {
		type: String,
		unique: true,
		trim: true
	},
	token: {
		type: String,
		// required: [true, "required"],
		trim: true
	},
	userName: {
		type: String,
		required: [true, "required"],
		trim: true
	},
	timestamp: {
		type: String,
		required: [true, "required"],
		trim: true
	}
}, {
	collection: config.collections.authentication
});

authenticationSchema.pre(['save', 'findOneAndUpdate'], function (next) {
	let obj = this;

	if (this._update && this._update['$set']) {
		obj = this._update['$set'];
	}

	obj.id = obj.id || uuid();

	next();
});

authenticationSchema.method('transform', function () {
	let obj = this.toObject();

	delete obj._id;
	delete obj.__v;

	return obj;
});


module.exports = db.model('authentication', authenticationSchema);