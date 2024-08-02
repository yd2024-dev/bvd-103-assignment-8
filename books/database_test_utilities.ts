import { ObjectId } from 'mongodb'
import { type ShelfId, type Book, type BookID, type OrderId } from '../documented_types'
import { type BookDatabaseAccessor } from './src/database_access'

export async function seedBookDatabase (accessor: BookDatabaseAccessor, { books }: { books: Record<BookID, Book> }): Promise<void> {
  await Promise.all(Object.keys(books).map(async (id) => {
    const objectId = ObjectId.createFromHexString(id)
    return await accessor.books.insertOne({ ...books[id], _id: objectId, id })
  }))
}
export function generateId<T> (): T {
  const id = new ObjectId()
  return (id.toHexString()) as T
}
