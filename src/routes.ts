import { Router } from 'express'

import authMiddleware from './app/middlewares/auth'
import isAdminMiddleware from './app/middlewares/isAdmin'
import UserValidator from './app/validators/UserValidator'
import PatientValidator from './app/validators/PatientValidator'
import uploadFiles from './config/uploadFiles'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import PatientController from './app/controllers/PatientController'

const routes = Router()

routes.get('/', (req, res) => res.json({ msg: 'Sys Vacina API' }))

routes.post('/session', SessionController.store)

routes.post(
  '/patients',
  uploadFiles,
  PatientValidator.store,
  PatientController.store
)

routes.use(authMiddleware)

routes.use(isAdminMiddleware)

routes.get('/users', UserController.index)
routes.post('/users', UserValidator.store, UserController.store)
routes.get('/users/:id', UserController.show)
routes.put('/users/:id', UserValidator.update, UserController.update)
routes.delete('/users/:id', UserController.destroy)

export default routes
