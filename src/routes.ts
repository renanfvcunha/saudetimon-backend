import { Router } from 'express'

import authMiddleware from './app/middlewares/auth'
import isAdminMiddleware from './app/middlewares/isAdmin'
import UserValidator from './app/validators/UserValidator'
import PatientValidator from './app/validators/PatientValidator'
import uploadFiles from './config/uploadFiles'
import uploadVacLocPics from './config/uploadVacLocPics'
import resizeImg from './app/middlewares/resizeImg'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import PatientController from './app/controllers/PatientController'
import GroupController from './app/controllers/GroupController'
import ComorbidityController from './app/controllers/ComorbidityController'
import FrequentDoubtController from './app/controllers/FrequentDoubtController'
import CategoryController from './app/controllers/CategoryController'
import StatusController from './app/controllers/StatusController'
import VaccineLocationController from './app/controllers/VaccineLocationController'
import PhoneController from './app/controllers/PhoneController'

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

routes.get('/comorbidities', ComorbidityController.index)

routes.get('/groups', GroupController.index)

routes.get('/doubts', FrequentDoubtController.index)

routes.get('/vaccinelocations', VaccineLocationController.index)

routes.get('/phones', PhoneController.index)

routes.get('/patients/:id/export', PatientController.exportSingle)
/** Middleware de autenticação. */
routes.use(authMiddleware)

routes.get('/patients', PatientController.index)
routes.get('/patients/export', PatientController.exportMany)
routes.get('/patients/:id', PatientController.show)
routes.patch(
  '/patients/:id/markasvaccinated',
  PatientController.markAsVaccinated
)
routes.patch('/patients/:id/group', PatientController.changeGroup)
routes.patch('/patients/:id/status', PatientController.changeStatus)

routes.post('/doubts', FrequentDoubtController.store)
routes.get('/doubts/:id', FrequentDoubtController.show)
routes.put('/doubts/:id', FrequentDoubtController.update)
routes.delete('/doubts/:id', FrequentDoubtController.destroy)

routes.get('/categories', CategoryController.index)

routes.get('/status', StatusController.index)

routes.post('/comorbidities', ComorbidityController.store)
routes.put('/comorbidities/:id', ComorbidityController.update)
routes.delete('/comorbidities/:id', ComorbidityController.destroy)

routes.post('/groups', GroupController.store)
routes.put('/groups/:id', GroupController.update)
routes.delete('/groups/:id', GroupController.destroy)

routes.post(
  '/vaccinelocations',
  uploadVacLocPics,
  VaccineLocationController.store
)
routes.put(
  '/vaccinelocations/:id',
  uploadVacLocPics,
  VaccineLocationController.update
)
routes.delete('/vaccinelocations/:id', VaccineLocationController.destroy)

routes.post('/phones', PhoneController.store)
routes.put('/phones/:id', PhoneController.update)
routes.delete('/phones/:id', PhoneController.destroy)

/** Middleware de verificação de admin */
routes.use(isAdminMiddleware)

routes.get('/users', UserController.index)
routes.post('/users', UserValidator.store, UserController.store)
routes.get('/users/:id', UserController.show)
routes.put('/users/:id', UserValidator.update, UserController.update)
routes.delete('/users/:id', UserController.destroy)

export default routes
