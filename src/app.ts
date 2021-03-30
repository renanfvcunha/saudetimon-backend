import express from 'express'
import { createConnection } from 'typeorm'

import routes from './routes'

class App {
  public express = express.application

  public constructor () {
    this.express = express()
    this.middlewares()
    this.routes()
    this.database()
  }

  private middlewares () {
    this.express.use(express.json())
  }

  private routes () {
    this.express.use(routes)
  }

  private async database () {
    try {
      await createConnection()

      console.log('DB Connected!')
    } catch (err) {
      console.error(err)
    }
  }
}

export default new App().express
