/**
 * @author Lohith Reddy Kalluru
 * @email 
 * @create date 2022-05-09 02:07:09
 * @modify date 2022-05-09 02:07:09
 * @desc Compilation js
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
 
 let compilationSchema = Schema({
     compileId: {
         type: String
     },
     userId: {
         type: String,
         required: [true, "required"],
         trim: true
     },
     programId: {
         type: String,
         trim: true
     },
     programName: {
         type: String,
         trim: true
     },
     status: {
         type: String,
         trim: true
     },
     output: {
         type: String,
         trim: true
     },
     err: {
         type: String,
         trim: true,
     },
     compilationPercentage: {
         type: Number,
         required: [true, "required"],
         trim: true
     },
     compilationMessage: {
         type: String,
         trim: true
     }
 }, {
     collection: config.collections.compilation
 });
 
 compilationSchema.set('timestamps', true);
 
 compilationSchema.index({ compileId: 1 }, { unique: true });
 
 compilationSchema.pre(['save', 'findOneAndUpdate'], function (next) {
     let obj = this;
 
     if (this._update && this._update['$set']) {
         obj = this._update['$set'];
     }
 
     obj.compileId = obj.compileId || uuid();
     next();
 });
 
 compilationSchema.method('transform', function () {
     let obj = this.toObject();
 
     delete obj._id;
     delete obj.__v;
     delete obj.userId;
 
     return obj;
 });
 
 compilationSchema.statics.getAllcompilations = function (projectId, callback) {
     let allCompilations = this.find({ userId: userId }, projectionsDefaults).sort({ createdAt : 1 }).lean();
     let compilations = [];
 
     async.each(allCompilations, function (doc, cb) {
         compilations.push(doc);
         cb();
     }, function (err) {
         if (err) {
             return callback(err);
         }
         return callback(null, compilations);
     });
 }
 
 compilationSchema.statics.getCompilationById = function (compilationId, callback) {
     this.findOne({ compileId: compilationId }, projectionsDefaults).lean().exec(function (err, doc) {
         if (!doc) {
             return null;
         }
         if (err) {
             return callback(err);
         } else {
             return callback(null, doc);
         }
     });
 };
 
 module.exports = db.model('Compilation', compilationSchema);