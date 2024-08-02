import { BodyProp, Controller, Get, Path, Post, Put, Route, SuccessResponse, Request } from 'tsoa'
import { type ShelfId, type BookID, type OrderId, type FulfilledBooks, type OrderPlacement, type Order } from '../../documented_types'
import { fulfilOrder } from './fulfil_order'
import { placeOrder } from './place_order'
import { listOrders } from './list_orders'
import { type ParameterizedContext, type DefaultContext, type Request as KoaRequest } from 'koa'
import { type AppOrderDatabaseState } from './database'

@Route('order')
export class OrderRoutes extends Controller {
  /**
     * Fulfil an order by taking all the relevant book copies for the order off the shelves
     * @param order The Order ID
     * @param booksFulfilled An array lsting how many copies of each book were taken from each shelf
     */
  @Put('{order}')
  @SuccessResponse(201, 'Fulfilled')
  public async fulfilOrder (
    @Path() order: OrderId,
      @BodyProp('booksFulfilled') booksFulfilled: FulfilledBooks,
      @Request() request: KoaRequest
  ): Promise<void> {
    const ctx: ParameterizedContext<AppOrderDatabaseState, DefaultContext> = request.ctx
    this.setStatus(201)
    try {
      await fulfilOrder(ctx.state.warehouse, order, booksFulfilled)
      this.setStatus(201)
    } catch (e) {
      this.setStatus(500)
      console.error('Error Fulfilling Order', e)
    }
  }

  /**
     * Place an order
     * @param order An array of the ordered book id's
     * @returns {OrderId}
     */
  @Post()
  @SuccessResponse(201, 'created')
  public async placeOrder (
    @BodyProp('order') order: OrderPlacement,
      @Request() request: KoaRequest
  ): Promise<OrderId> {
    const ctx: ParameterizedContext<AppOrderDatabaseState, DefaultContext> = request.ctx
    this.setStatus(201)
    try {
      const result = await placeOrder(ctx.state.warehouse, order)
      return result
    } catch (e) {
      this.setStatus(500)
      return ''
    }
  }

  /**
   * Get all the pending orders
   * @returns {Order[]}
   */
  @Get()
  public async listOrders (
    @Request() request: KoaRequest): Promise<Order[]> {
    const ctx: ParameterizedContext<AppOrderDatabaseState, DefaultContext> = request.ctx
    return await listOrders(ctx.state.warehouse)
  }
}
