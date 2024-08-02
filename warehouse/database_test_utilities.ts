import { ObjectId } from 'mongodb'
import { type ShelfId, type Book, type BookID, type OrderId } from './src/documented_types'
import { type WarehouseDatabaseAccessor } from './src/warehouse_database'

export async function seedWarehouseDatabase (accessor: WarehouseDatabaseAccessor, { books }: { books: Record<BookID, Record<ShelfId, number>>}): Promise<void> {
  await Promise.all([
    ...Object.keys(books).flatMap(async (book) => {
      const shelves = books[book]

      return Object.keys(shelves).map(async (shelf) => {
        return await accessor.books.insertOne({ book, shelf, count: shelves[shelf] })
      })
    }),
  ])
}

export function generateId<T> (): T {
  const id = new ObjectId()
  return (id.toHexString()) as T
}
