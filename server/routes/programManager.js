/**
 * file: routes/projectManager.js
 * author: Amith GSPN <amith@opennets.com>
 * description:
 *      Exposes CRUD API's to perform operations on project
*/

let express = require("express");
let router = express.Router();
let projectModel = require("../db/models/program");
let userModel = require("../db/models/user");


/* Create Project */
router.post("/", async(req, res) => {
    data = {
        name: req.body.name,
        description: req.body.description,
        language: req.body.language || "p4",
        mode: req.body.mode || "normal",
        type: req.body.type || "personal",
        model: req.body.model || "v1model",
        visibility: req.body.visibility || "private",
        ownerId: req.body.ownerId,
        orgId: req.body.orgId,
        members: req.body.members || [],
        MAX_NODE_ID: req.body.MAX_NODE_ID || 1
    };

    try {
        let newDoc = await projectModel.create(data);
        res.status(200).json(newDoc.transform());
    }
    catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            e = new Error();
            e.status = 409;
            e.message = "name already in use, choose a different one";
            return e;
        }
    }
});

/* Read all Projects*/
router.get("/", async function(req, res) {
    try {
        let projects = await projectModel.find({});
        if (projects.length === 0) {
            e = new Error();
            e.status = 404;
            e.message = "No Projects in collection";

            res.status(404).send(e);
        } else {
            return res.status(200).json(projects);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

/* Explore all Projects*/
router.get("/explore_projects", async function(req, res) {
    try {
        let projects = await projectModel.find({ visibility: 'public' });
        if (projects.length === 0) {
            e = new Error();
            e.status = 404;
            e.message = "No Projects in collection";

            res.status(404).send(e);
        }
        return res.status(200).json(projects);
    } catch (e) {
        res.status(500).send(e);
    }
});

/* Read Project by type*/
router.get("/projectByType", async(req, res) => {
    let type = util.getValueByName(req, 'type');
    try {
        let project = await projectModel.find({ type: type });

        if (!project) {
            e = new Error();
            e.status = 404;
            e.message = "Project not found";
            
            res.status(404).send(e);
        } else {
            return res.status(200).json(project);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

/* Read Project by organisation id*/
router.get("/projectsUnderOrg", async(req, res) => {
    let orgId = util.getValueByName(req, 'orgId');
    
    try {
        let projects = await projectModel.find({ orgId: orgId });

        if (!projects) {
            e = new Error();
            e.status = 404;
            e.message = "Project not found";
            
            res.status(404).send(e);
        } else {
            return res.status(200).json(projects);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

/* Read Project by organisation id and team id*/
router.get("/projectsUnderTeam", async(req, res) => {
    let teamId = util.getValueByName(req, 'teamId');
    try {
        let projects = await projectModel.find({ teamIds: teamId });

        if (!projects) {
            e = new Error();
            e.status = 404;
            e.message = "No projects under this team";
            
            res.status(404).send(e);
        } else {
            return res.status(200).json(projects);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

/* List personal projects of a user*/
router.get("/projectsOfUser", async(req, res) => {
    let userId = util.getValueByName(req, 'userId');
    
    try {
        let projects = await projectModel.find({ 'members.userId': userId, type: 'personal' });
        let projectList = [];
        
        for (let project of projects) {
            let user = await userModel.findOne({ id: project.ownerId });
            let name = user.name;
            var pair = {ownerName: name};
            project = {...project._doc, ...pair};
            projectList.push(project);
        }

        if (!projects) {
            e = new Error();
            e.status = 404;
            e.message = "Projects not found";
            
            res.status(404).send(e);
        } else {
            return res.status(200).json(projectList);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

/* List organisation projects of a user*/
router.get("/orgProjectsOfUser", async(req, res) => {
    let userId = util.getValueByName(req, 'userId');

    try {
        let organisations = await organisationModel.find({ 'members.userId': userId });
        let projects = [];
        for (let org of organisations) {
            for (let member of org.members) {
                if (member.userId === userId) {
                    var pair = {role: member.role};
                    org = {...org._doc, ...pair};
                }
            }
            let projectList = [];
            projectList = await projectModel.find({ orgId: org.id });
            for (let project of projectList) {
                let name = org.name;
                var pair = {ownerName: name, role: org.role};
                project = {...project._doc, ...pair};
                projects.push(project);
            }
        }
        if (!projects) {
            e = new Error();
            e.status = 404;
            e.message = "Projects not available";
            
            res.status(404).send(e);
        } else {
            return res.status(200).json(projects);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

/* Read Project by name*/
router.get("/projectByName", async(req, res) => {
    let name = util.getValueByName(req, 'name');
    try {
        let project = await projectModel.findOne({ name: name });

        if (!project) {
            e = new Error();
            e.status = 404;
            e.message = "Project not found";
            
            res.status(404).send(e);
        } else {
            return res.status(200).json(project);
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
        e.message = "project id is required"

        return next(e);
    }
    else next();
});

/* Read Project by id*/
router.get("/projectById", async(req, res) => {
    let id = util.getValueByName(req, 'id');
    try {
        let project = await projectModel.findOne({ id: id });

        if (!project) {
            e = new Error();
            e.status = 404;
            e.message = "Project not found";
            
            res.status(404).send(e);
        } else {
            return res.status(200).json(project);
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get("/projectDetails", async(req, res) => {
    let projectId = util.getValueByName(req, 'id');
    let userId = util.getValueByName(req, 'userId');

    try {
        let project = await projectModel.findOne({ id: projectId });
        let count = 0;
        
        if (project.teamIds.length > 0) {
            for( let teamId of project.teamIds) {
                let team = await teamModel.findOne({ id: teamId, 'members.userId': userId });
                if (team) {
                    count = count + 1;
                }
            }
            if (count > 0) {
                return res.status(200).send("true");
            } else {
                return res.status(200).send("false");
            }
        } else if (project.ownerId == userId) {
            return res.status(200).send("true");
        } else if (project.type === "organisation") {
            let organisation = await organisationModel.findOne({ id: project.orgId, 'members.userId': userId });
            if (organisation) {
                return res.status(200).send("true");
            } else {
                return res.status(200).send("false");
            }
        } else {
            return res.status(200).send("false");
        }
    } catch (e) {
        res.status(500).send(e);
    }
})

/* Update the Project */
router.put("/", async(req, res) => {
    data = {
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        language: req.body.language
    };

    try {
        let updateDoc = await projectModel.findOneAndUpdate(
            { id: req.body.id },
            { $set: data, $inc: { __v: 1 } },
            { new: true, runValidators: true }
        );

        if (!updateDoc) {
            e = new Error();
            e.status = 404;
            e.message = 'project not found';

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

/* Delete the project */
router.delete('/', async function (req, res, next) {
    let projectId = util.getValueByName(req, 'id');
    let typedefSchema = require('../db/models/typedef');
    let structSchema = require('../db/models/structure');
    let functionSchema = require('../db/models/functions');
    let tableSchema = require('../db/models/tables');
    let parserSchema = require('../db/models/parser');
    let controlBlockSchema = require('../db/models/controlFlowBlocks');
    let progModelSchema = require('../db/models/programModels');
    let networkSchema = require('../db/models/network');
    let busSchema = require('../db/models/bus');

    try {
        let delDoc = await projectModel.findOneAndRemove({ id: projectId });

        if (!delDoc) {
            e = new Error();
            e.status = 404;
            e.message = 'You are not allowed to delete this project';

            return next(e);
        } else {
            await typedefSchema.deleteMany({ projectId: projectId }, {});
            await structSchema.deleteMany({ projectId: projectId }, {});
            await functionSchema.deleteMany({ projectId: projectId }, {});
            await tableSchema.deleteMany({ projectId: projectId }, {});
            await parserSchema.deleteMany({ projectId: projectId }, {});
            await controlBlockSchema.deleteMany({ projectId: projectId }, {});
            await progModelSchema.deleteMany({ projectId: projectId }, {});
            await networkSchema.deleteMany({ projectId: projectId }, {});
            await busSchema.deleteMany({ projectId: projectId }, {});
            return res.status(200).json({ id: projectId, "deleted": true });
        }
    } catch (err) {
        return next(err);
    }
});

module.exports = router;