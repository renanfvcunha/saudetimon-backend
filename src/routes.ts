import { Router } from 'express'

const routes = Router()

routes.get('/', (req, res) => res.json({ msg: 'Sys Vacina API' }))

export default routes
