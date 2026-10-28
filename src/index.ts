import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { optionalAuth } from './middleware/auth.js'
import auth from './routes/auth.js'
import properties from './routes/properties.js'
import { env } from './env.js'

const app = new Hono({strict: false})

app.use('*', optionalAuth)

app.use('*', cors({
  origin: env.frontendUrl,
  allowMethods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
  allowHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}))

app.get('/', (c) => {
  return c.json({name: 'Stay Finder'})
})

app.route("/auth", auth)
app.route("/properties", properties)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
