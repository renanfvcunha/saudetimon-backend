import { Router } from 'express'

import authMiddleware from './app/middlewares/auth'
import isAdminMiddleware from './app/middlewares/isAdmin'
import UserValidator from './app/validators/UserValidator'
import PatientValidator from './app/validators/PatientValidator'
import uploadFiles from './config/uploadFiles'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import PatientController from './app/controllers/PatientController'
import PatientStatusController from './app/controllers/PatientStatusController'
import GroupController from './app/controllers/GroupController'

const routes = Router()

routes.get('/', (req, res) => res.json({ msg: 'Saúde Timon API' }))

routes.post('/session', SessionController.store)

routes.post(
  '/patients',
  uploadFiles,
  PatientValidator.store,
  PatientController.store
)
// routes.put('/patients/:cpf', PatientController.update)
routes.get('/patients/checkupdatable/:cpf', PatientController.checkUpdatable)
routes.get('/patients/status/:cpf', PatientController.getStatus)

routes.get('/groups', GroupController.index)

/** Middleware de autenticação. */
routes.use(authMiddleware)

routes.get('/patients', PatientController.index)
routes.get('/patients/:id', PatientController.show)

routes.get('/patients/status', PatientStatusController.index)

routes.patch('/patients/status/:id', PatientController.changeStatus)

/** Middleware de verificação de admin */
routes.use(isAdminMiddleware)

routes.get('/users', UserController.index)
routes.post('/users', UserValidator.store, UserController.store)
routes.get('/users/:id', UserController.show)
routes.put('/users/:id', UserValidator.update, UserController.update)
routes.delete('/users/:id', UserController.destroy)

export default routes
