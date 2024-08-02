import { ObjectId } from 'mongodb'
import { type ShelfId, type Book, type BookID, type OrderId } from '../documented_types'

import { type OrderDatabaseAccessor } from './src/database'


export async function seedWarehouseDatabase (accessor: OrderDatabaseAccessor, { orders }: { orders: Record<OrderId, Record<BookID, number>> }): Promise<void> {
  await Promise.all([
    ...Object.keys(orders).map(async (order) => {
      const _id = ObjectId.createFromHexString(order)
      return await accessor.orders.insertOne({ _id, books: orders[order] })
    })
  ])
}

export function generateId<T> (): T {
  const id = new ObjectId()
  return (id.toHexString()) as T
}
