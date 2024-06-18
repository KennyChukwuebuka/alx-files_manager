import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

/**
 * Routes the requests to the appropriate controller based on the URL path.
 *
 * @param {Object} app - The Express application object.
 * @return {void} This function does not return anything.
 */
function controllerRouting(app) {
  const router = express.Router();
  app.use('/', router);

  // App Controller

  // route that should return the status of Redis and DB
  router.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });

  // Route to return the number of users and files in the DB
  router.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });

  // User Controller

  // should create a new user document in DB
  router.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });

  // Route to return the user document based on the token
  router.get('/users/me', (req, res) => {
    UsersController.getMe(req, res);
  });

  // Auth Controller

  // Route to return the user document based on the token
  router.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  });

  // Route to return the user document based on the token
  router.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(req, res);
  });

  // Files Controller

  // Route to return the file document based on the ID
  router.post('/files', (req, res) => {
    FilesController.postUpload(req, res);
  });

  // Route to return the file document based on the ID
  router.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  });

  // Route to return the file document based on the ID
  router.get('/files', (req, res) => {
    FilesController.getIndex(req, res);
  });

  // Route to return the file document based on the ID
  router.put('/files/:id/publish', (req, res) => {
    FilesController.putPublish(req, res);
  });

  // Route to return the file document based on the ID
  router.put('/files/:id/unpublish', (req, res) => {
    FilesController.putUnpublish(req, res);
  });

  // Route to return the file document based on the ID
  router.get('/files/:id/data', (req, res) => {
    FilesController.getFile(req, res);
  });
}
// eslint-disable-next-line import/prefer-default-export
export default controllerRouting;
