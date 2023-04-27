/**
 * @author Lohith Reddy Kalluru
 * @email 
 * @create date 2022-05-09 00:02:31
 * @modify date 2022-05-09 00:02:31
 * @desc Compilation routes
 */

let express = require('express');
const childProcess = require('child_process');
let userModel = require('../db/models/user');
let router = express.Router();
let compilationSchema = require('../db/models/compilation');
let util = require('../lib/stubs/utils');
let aws = require('aws-sdk');
let fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const {PythonShell} = require("python-shell");

var queueUrl = ""
// aws.config.loadFromPath(__dirname + '/../configuration.json');
// var sqs = new aws.SQS();

/* Fetch List of compilations */

/*check whether `id` is a part of the request body*/
router.use(async function (req, res, next) {
    let id = util.getValueByName(req, 'userId');
    console.log(id);

    if (!id) {
        e = new Error();
        e.status = 400;
        e.message = "user id is required"

        return next(e);
    }
    try {
        let user = await userModel.findOne({ id: id });
       

        if (!user) {
            try {
                throw new Error('Invalid Id');
            } catch (er) {
                return next(er)
            }
        } else {
            next();
        }
    } catch (e) {
        res.status(500).send(e);
    }

});

router.get('/byCompileId', async function (req, res, next) {
    let userid = util.getValueByName(req, 'userId');
    let compileId = util.getValueByName(req, 'compileId');

    compilationSchema.getCompilationById(compileId, function (err, doc) {
        if (err) {
            return next(err);
        }
        return res.status(200).json(doc);
    });
});

router.post('/localCompile', async function (req, res, next) {
    let userid = util.getValueByName(req, 'userId');
    console.log(userid);
    try {
        formData = {
            userId: userid,
            programId: req.body.programId || uuidv4(),
            status: req.body.status || 0,
            output: req.body.output || "",
            programName: req.body.programName || "",
            compilationPercentage: req.body.compilationPercentage || 0,
            compilationMessage: req.body.compilationMessage || "",
            language: req.body.language
        };
        

        let Doc = await compilationSchema.create(formData);
        let code = req.body.code;
        fs.writeFileSync(__dirname + '/' + formData.programId + '.py', code, function (err) {
            if (err) {
                console.log('File not written')
            }
            console.log('success')
        })

        let pyshell = new PythonShell(__dirname + '/' + formData.programId + '.py');
        let output ="";
        pyshell.on('message', function (message) {
            output = output+message;      
            console.log(output);
        });
    
        
        let compilationData = {
            userid: userid,
            programId: formData.programId,
            status: 0,
            output: "",
            status: "",
            compilationPercentage: 100,
            compilationMessage: "",
            output: "",
            err:""
        }
        pyshell.end(async function (err) {
            compilationData.status = "SUCCESS";
            compilationData.compilationMessage = "successfully compiled";
            compilationData.output = output;
            if (err) {
                compilationData.status = "FAILURE";
                compilationData.compilationMessage = "compile error";
                console.log(err.stack);
                compilationData.err = JSON.stringify(err.stack);
               
            };
            let newDoc = await compilationSchema.findOneAndUpdate(
                { compileId: Doc.compileId },
                { $set: compilationData, $inc: { __v: 1 } },
                { new: true, runValidators: true }
            );
                
            res.status(200).json(newDoc.transform())
            console.log('finished');
            fs.unlinkSync(__dirname + '/' + formData.programId + '.py')
        });
    
    }
    catch(err){
        return next(err);
    };
});
            
     

router.post('/', async function (req, res, next) {
    let url = "";

    if (req.hostname === 'localhost') {
        url = req.protocol + "://" + req.hostname + ":3001"
    } else {
        url = "https://" + req.hostname + "/api"
    }

    formData = {
        userid: userId,
        programId: req.body.programId || uuidv4(),
        status: req.body.status || 0,
        output: req.body.output || "",
        programName: req.body.programName || "",
        compilationPercentage: req.body.compilationPercentage || 0,
        compilationMessage: req.body.compilationMessage || "",
        language: req.body.language
    };

    try {
        let newDoc = await compilationSchema.create(formData);
        var params = {
            MessageBody: JSON.stringify({
                "compileId": newDoc.compileId,
                "url": url,
                "language": req.body.language,
                "requestType": "compileRequest"
            }),
            QueueUrl: queueUrl,
            DelaySeconds: 0,
            MessageDeduplicationId: newDoc.compileId,  // Required for FIFO queues
            MessageGroupId: newDoc.compileId,  // Required for FIFO queues
        };

        // sqs.sendMessage(params, function (err, data) {
        //     if (err) {
        //         next(err);
        //     }
        //     res.status(200).json(newDoc.transform())
        // });
    }
    catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            e = new Error();
            e.status = 409;
            e.message = "";
            return next(e);
        }

        return next(err);
    }
});

router.put('/', async function (req, res, next) {
    let projectId = util.getProjectId(req);

    data = {
        compileId: req.body.compileId,
        status: req.body.status,
        output: req.body.output,
        compilationPercentage: req.body.compilationPercentage,
        compilationMessage: req.body.compilationMessage,
        err:req.body.err
    };

    // console.log(data)

    try {
        let updateDoc = await compilationSchema.findOneAndUpdate(
            { compileId: req.body.compileId, projectId: projectId },
            { $set: data, $inc: { __v: 1 } },
            { new: true, runValidators: true }
        );

        if (!updateDoc) {
            e = new Error();
            e.status = 404;
            e.message = 'compilation not found';

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

router.delete('/', async function (req, res, next) {
    let projectId = util.getProjectId(req);
    let compileId = util.getValueByName(req, 'compileId');
    try {
        let delDoc = await compilationSchema.findOneAndRemove({ projectId: projectId, compileId: compileId });

        if (!delDoc) {
            e = new Error();
            e.status = 404;
            e.message = 'compilation not found';

            return next(e);
        } else {
            return res.status(200).json({ compileId: compileId, projectId: projectId, "deleted": true });
        }
    } catch (err) {
        return next(err);
    }

});

module.exports = router;