import 'dotenv/config'

import app from './app'

const port = process.env.APP_PORT

app.listen(port || 3333, () => {
  console.log(`Listening on ${port}`)
})
