import { BodyProp, Controller, Get, Path, Post, Put, Route, SuccessResponse, Request } from 'tsoa'
import { getBookInfo } from './get_book_info'
import { type ShelfId, type BookID} from '../../documented_types'
import { placeBooksOnShelf } from './place_on_shelf'
import { type ParameterizedContext, type DefaultContext, type Request as KoaRequest } from 'koa'
import { type AppWarehouseDatabaseState } from './warehouse_database'

@Route('warehouse')
export class WarehouseRoutes extends Controller {
  /**
     * Find the shelves that have copies of the book, and how
     * many copies each shelf has
     * @param book The book's unique identifier!
     * @returns {BookInfo}
     */
  @Get('{book}')
  public async getBookInfo (
    @Path() book: BookID,
      @Request() request: KoaRequest
  ): Promise<Record<string, number>> {
    const ctx: ParameterizedContext<AppWarehouseDatabaseState, DefaultContext> = request.ctx
    const data = ctx.state.warehouse
    return await getBookInfo(data, book)
  }

  /**
   * Add copies of a book to a provided shelf
   * @param book The book's unique identifier
   * @param shelf The shelf's name
   * @param number The number of copies to place on the shelf
   */
  @Put('{book}/{shelf}/{number}')
  @SuccessResponse(201, 'Added')
  public async placeBooksOnShelf (@Path() book: BookID, @Path() shelf: ShelfId, @Path() number: number,
    @Request() request: KoaRequest): Promise<void> {
    const ctx: ParameterizedContext<AppWarehouseDatabaseState, DefaultContext> = request.ctx
    this.setStatus(201)
    await placeBooksOnShelf(ctx.state.warehouse, book, number, shelf)
  }
}