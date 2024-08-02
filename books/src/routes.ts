import type * as koa from 'koa'
import { Controller, Route, Request, Body, Post, Get, Path } from 'tsoa'
import { type BookID, type Book, type Filter } from '../../documented_types'
import { type AppBookDatabaseState } from './database_access'
import listBooks from './list'
import createOrUpdateBook from './create_or_update'
import getBook from './lookup'

@Route('books')
export class BooksRoutes extends Controller {
  @Post('list')
  public async listBooks (@Body() filters: Filter[], @Request() request: koa.Request): Promise<Book[]> {
    const ctx: koa.ParameterizedContext<AppBookDatabaseState, koa.DefaultContext> = request.ctx
    return await listBooks(ctx.state.books, filters)
  }

  @Post()
  public async createOrUpdateBook (@Body() book: Book, @Request() request: koa.Request): Promise<{ id: BookID }> {
    const ctx: koa.ParameterizedContext<AppBookDatabaseState, koa.DefaultContext> = request.ctx
    const result = await createOrUpdateBook(book, ctx.state.books)

    if (result !== false) {
      return { id: result }
    } else {
      this.setStatus(404)
      return { id: book.id ?? '' }
    }
  }

  @Get("{book}")
  public async getBook(@Path() book: BookID, @Request() request: koa.Request): Promise<Book> {

    const ctx: koa.ParameterizedContext<AppBookDatabaseState, koa.DefaultContext> = request.ctx

    const result = await getBook(book, ctx.state.books)

    if (result !== false) {
      return result
    } else {
      this.setStatus(404)
      throw new Error("Couldn't find book");
    }
  }
}
