// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false
};

const apiServer = "";
const socketServer = "";

export const apiUrls = {
  socketServer:apiServer,
  apiServer:apiServer,

  // Page user
  userManager: apiServer + 'usersManager',

  // Project
  project: apiServer + 'projectManager',
 
 // ForgotPasswords
 forgotPassword: apiServer + 'forgotPasswordManager', 

  // Invitations
  invite: apiServer + 'inviteManager',
};

