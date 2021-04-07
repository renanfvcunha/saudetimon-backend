import express from 'express'
import { createConnection } from 'typeorm'
import cors from 'cors'
import { resolve } from 'path'

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
    this.express.use(
      cors({
        origin: process.env.CLIENT_URL,
        exposedHeaders: ['Total-Count', 'Page']
      })
    )
  }

  private routes () {
    this.express.use(
      '/uploads',
      express.static(resolve(__dirname, '..', 'uploads'))
    )
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
