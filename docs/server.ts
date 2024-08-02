import Koa from 'koa'
import cors from '@koa/cors'
import qs from 'koa-qs'
import zodRouter from 'koa-zod-router'
import KoaRouter from '@koa/router'
import { koaSwagger } from 'koa2-swagger-ui'
import bodyParser from 'koa-bodyparser'
import swagger from "./swagger.json"
import { type Server, type IncomingMessage, type ServerResponse } from 'http'

export default async function (port?: number): Promise<{ server: Server<typeof IncomingMessage, typeof ServerResponse> }> {

  const app = new Koa<Koa.DefaultState, Koa.DefaultContext>()
  // And we add cors to ensure we can access our API from the mcmasterful-books website
  app.use(cors())

  app.use(koaSwagger({
    routePrefix: '/docs',
    specPrefix: '/docs/spec',
    exposeSpec: true,
    swaggerOptions: {
      spec: swagger
    }

  }))
  return {
    server: app.listen(port, () => {
      console.log('listening')
    })
  }
}
