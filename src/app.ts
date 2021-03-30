import express from 'express'
import { createConnection } from 'typeorm'

import routes from './routes'

class App {
  public express = express.application

  public constructor () {
    this.express = express()
    this.routes()
    this.database()
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
