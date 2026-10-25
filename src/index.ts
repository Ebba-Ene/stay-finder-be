import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import auth from './routes/auth.js'
import { optionalAuth } from './middleware/auth.js'

const app = new Hono({strict: false})

app.use('*', optionalAuth)

app.get('/', (c) => {
  return c.json({name: 'Stay Finder'})
})

app.route("/auth", auth)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
