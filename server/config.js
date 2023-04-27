/**
 * @author Lohith Reddy Kalluru
 * @email lohith566@gmail.com
 * @create date 2022-05-05 09:34:36
 * @modify date 2022-05-05 09:34:36
 * @desc configuration for databases and other related info
 */




 module.exports = {
    database: {
        // Database credentials for the course.
        default: {
            name: 'ide',
            host: 'localhost',
            port: '27017',
            user: null,
            password: null,
        },
    },
    collections: {
        stdHeaders: 'std_headers',
        users: 'users',
        projects: 'projects',
        authentication: 'authentication'
        
       
    },
 
    PORT: '3001',
    name: /^(_)?[A-Za-z][A-Za-z0-9_@$%&*]{0,}$/
};