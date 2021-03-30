import express from 'express'

class App {
  public express = express.application

  public constructor () {
    this.express = express()
    this.express.get('/', (req, res) => res.json({ msg: 'Working' }))
  }
}

export default new App().express
