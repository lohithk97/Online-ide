/**
 * @author Lohith Reddy Kalluru
 * @email 
 * @create date 2022-05-05 12:18:46
 * @modify date 2022-05-05 12:18:46
 * @desc   forgot pasword schema
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


let forgotPasswordSchema = Schema({
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
	email: {
		type: String,
		required: [true, "required"],
		trim: true
	}
}, {
	collection: config.collections.forgotPassword
});

forgotPasswordSchema.set('timestamps', true);

forgotPasswordSchema.pre(['save', 'findOneAndUpdate'], function (next) {
	let obj = this;

	if (this._update && this._update['$set']) {
		obj = this._update['$set'];
	}

	obj.id = obj.id || uuid();

	next();
});

forgotPasswordSchema.method('transform', function () {
	let obj = this.toObject();

	delete obj._id;
	delete obj.__v;

	return obj;
});

module.exports = db.model('forgotPassword', forgotPasswordSchema);