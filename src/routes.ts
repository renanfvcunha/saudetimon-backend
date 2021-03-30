import { Router } from 'express'

import UserValidator from './app/validators/UserValidator'

import UserController from './app/controllers/UserController'

const routes = Router()

routes.get('/', (req, res) => res.json({ msg: 'Sys Vacina API' }))

routes.get('/users', UserController.index)
routes.post('/users', UserValidator.store, UserController.store)
routes.get('/users/:id', UserController.show)
routes.put('/users/:id', UserValidator.update, UserController.update)
routes.delete('/users/:id', UserController.destroy)

export default routes
