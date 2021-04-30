import { Router } from 'express'

import authMiddleware from './app/middlewares/auth'
import isAdminMiddleware from './app/middlewares/isAdmin'
import UserValidator from './app/validators/UserValidator'
import PatientValidator from './app/validators/PatientValidator'
import uploadFiles from './config/uploadFiles'
import resizeImg from './app/middlewares/resizeImg'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import PatientController from './app/controllers/PatientController'
import GroupController from './app/controllers/GroupController'
import ComorbidityController from './app/controllers/ComorbidityController'
import FrequentDoubtController from './app/controllers/FrequentDoubtController'

const routes = Router()

routes.get('/', (req, res) => res.json({ msg: 'Saúde Timon API' }))

routes.post('/session', SessionController.store)

routes.post(
  '/patients',
  uploadFiles,
  PatientValidator.store,
  resizeImg,
  PatientController.store
)
routes.get('/patients/status/:cpf', PatientController.getStatus)
routes.get('/patients/me/:cpf', PatientController.me)
routes.put(
  '/patients/:id',
  uploadFiles,
  PatientValidator.update,
  resizeImg,
  PatientController.update
)

routes.get('/groups', GroupController.index)

routes.get('/comorbidities', ComorbidityController.index)

routes.get('/doubts', FrequentDoubtController.index)

/** Middleware de autenticação. */
routes.use(authMiddleware)

routes.get('/patients', PatientController.index)
routes.get('/patients/:id', PatientController.show)

routes.patch('/patients/status/:id', PatientController.changeStatus)

routes.post('/doubts', FrequentDoubtController.store)
routes.get('/doubts/:id', FrequentDoubtController.show)
routes.put('/doubts/:id', FrequentDoubtController.update)
routes.delete('/doubts/:id', FrequentDoubtController.destroy)

/** Middleware de verificação de admin */
routes.use(isAdminMiddleware)

routes.get('/users', UserController.index)
routes.post('/users', UserValidator.store, UserController.store)
routes.get('/users/:id', UserController.show)
routes.put('/users/:id', UserValidator.update, UserController.update)
routes.delete('/users/:id', UserController.destroy)

export default routes
