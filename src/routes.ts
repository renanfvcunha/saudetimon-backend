import { Router } from 'express'

import authMiddleware from './app/middlewares/auth'
import isAdminMiddleware from './app/middlewares/isAdmin'
import UserValidator from './app/validators/UserValidator'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'

const routes = Router()

routes.get('/', (req, res) => res.json({ msg: 'Sys Vacina API' }))

routes.post('/session', SessionController.store)

routes.use(authMiddleware)

routes.use(isAdminMiddleware)

routes.get('/users', UserController.index)
routes.post('/users', UserValidator.store, UserController.store)
routes.get('/users/:id', UserController.show)
routes.put('/users/:id', UserValidator.update, UserController.update)
routes.delete('/users/:id', UserController.destroy)

export default routes
