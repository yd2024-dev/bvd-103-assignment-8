import { ObjectId, type Collection, type Db } from 'mongodb'
import { type BookID, type OrderId, type ShelfId } from '../../documented_types'
import { client } from './database_access'
import { type WarehouseData, InMemoryWarehouse } from './warehouse_data'
import { generateId, seedWarehouseDatabase } from '../database_test_utilities'

export interface WarehouseDatabaseAccessor {
  database: Db
  books: Collection<{ book: BookID, shelf: ShelfId, count: number }>
}
export interface AppWarehouseDatabaseState {
  warehouse: WarehouseData
}

export async function getWarehouseDatabase (dbName?: string): Promise<WarehouseDatabaseAccessor> {
  const database = client.db(dbName ?? Math.floor(Math.random() * 100000).toPrecision())
  const books = database.collection<{ book: BookID, shelf: ShelfId, count: number }>('books')
  await books.createIndex({ book: 1, shelf: 1 }, { unique: true })

  return {
    database,
    books
  }
}

export class DatabaseWarehouse implements WarehouseData {
  accessor: WarehouseDatabaseAccessor

  constructor (accessor: WarehouseDatabaseAccessor) {
    this.accessor = accessor
  }

  async placeBookOnShelf (book: string, shelf: string, count: number): Promise<void> {
    await this.accessor.books.findOneAndReplace({ book, shelf }, { book, shelf, count }, { upsert: true })
  }

  async getCopiesOnShelf (book: string, shelf: string): Promise<number> {
    const result = await this.accessor.books.findOne({ book, shelf })
    return result !== null ? result.count : 0
  }

  async getCopies (book: string): Promise<Record<ShelfId, number>> {
    const result = this.accessor.books.find({ book })
    const copies: Record<ShelfId, number> = {}

    while (await result.hasNext()) {
      const value = await result.next()
      if (value === null) {
        break
      }
      copies[value.shelf] = value.count
    }

    return copies
  }
}

if (import.meta.vitest !== undefined) {
  const { test, expect } = import.meta.vitest

  test('placing a book adds the book to the database', async () => {
    const memData = new InMemoryWarehouse()
    const dbData = new DatabaseWarehouse(await getWarehouseDatabase())

    const book = generateId<BookID>()
    const shelf = 'my_shelf'
    const copies = 5

    await Promise.all([memData.placeBookOnShelf(book, shelf, copies), dbData.placeBookOnShelf(book, shelf, copies)])
    const [memResult, dbResult] = await Promise.all([memData.getCopiesOnShelf(book, shelf), dbData.getCopiesOnShelf(book, shelf)])

    expect(memResult).toEqual(dbResult)
    expect(dbResult).toEqual(5)
  })

  test('getting a non existant book/shelf combination returns a zero', async () => {
    const memData = new InMemoryWarehouse()
    const dbData = new DatabaseWarehouse(await getWarehouseDatabase())

    const [memResult, dbResult] = await Promise.all([memData.getCopiesOnShelf('book', 'shelf'), dbData.getCopiesOnShelf('book', 'shelf')])

    expect(memResult).toEqual(dbResult)
    expect(dbResult).toEqual(0)
  })

  test('get all the copies of an existing book', async () => {
    const dbPromise = getWarehouseDatabase()
    const db = await dbPromise

    const bookId = generateId<BookID>()
    const seed = { books: { [bookId]: { shelf_1: 5, shelf_2: 3 } }, orders: {} }

    await seedWarehouseDatabase(db, seed)
    const memData = new InMemoryWarehouse(seed)
    const dbData = new DatabaseWarehouse(db)

    const [memResult, dbResult] = await Promise.all([memData.getCopies(bookId), dbData.getCopies(bookId)])

    expect(memResult.shelf_1).toEqual(dbResult.shelf_1)
    expect(dbResult.shelf_1).toEqual(5)
    expect(memResult.shelf_2).toEqual(dbResult.shelf_2)
    expect(dbResult.shelf_2).toEqual(3)
  })
}

export async function getDefaultWarehouseDatabase (name?: string): Promise<WarehouseData> {
  const db = await getWarehouseDatabase(name)
  return new DatabaseWarehouse(db)
}
