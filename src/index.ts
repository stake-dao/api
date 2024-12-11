import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import strategies from './strategies'
import lockers from './lockers'
import tokens from './tokens'
import votemarket from './votemarket'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/strategies', strategies)
app.route('/lockers', lockers)
app.route('/tokens', tokens)
app.route('/votemarket', votemarket)
const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
