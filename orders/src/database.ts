import { ObjectId, type Collection, type Db } from 'mongodb'
import { type BookID, type OrderId, type ShelfId } from '../../documented_types'
import { client } from './database_access'
import { type WarehouseData as OrderData, InMemoryWarehouse } from './data'

export interface OrderDatabaseAccessor {
  database: Db
  orders: Collection<{ books: Record<BookID, number> }>
}
export interface AppOrderDatabaseState {
  warehouse: OrderData
}

export async function getWarehouseDatabase (dbName?: string): Promise<OrderDatabaseAccessor> {
  const database = client.db(dbName ?? Math.floor(Math.random() * 100000).toPrecision())
  const orders = database.collection<{ books: Record<BookID, number> }>('orders')

  return {
    database,
    orders
  }
}

export class DatabaseWarehouse implements OrderData {
  accessor: OrderDatabaseAccessor

  constructor (accessor: OrderDatabaseAccessor) {
    this.accessor = accessor
  }

  async getOrder (order: OrderId): Promise<Record<BookID, number> | false> {
    const result = await this.accessor.orders.findOne({ _id: ObjectId.createFromHexString(order) })
    return result !== null ? result.books : false
  }

  async removeOrder (order: OrderId): Promise<void> {
    await this.accessor.orders.deleteOne({ _id: ObjectId.createFromHexString(order) })
  }

  async listOrders (): Promise<Array<{ orderId: OrderId, books: Record<BookID, number> }>> {
    const result = await this.accessor.orders.find().toArray()

    return result.map(({ _id, books }) => {
      return { orderId: _id.toHexString(), books }
    })
  }

  async placeOrder (books: Record<string, number>): Promise<OrderId> {
    const result = await this.accessor.orders.insertOne({ books })
    return result.insertedId.toHexString()
  }
}

if (import.meta.vitest !== undefined) {
  const { test, expect } = import.meta.vitest

  test('order crud works as expected', async () => {
    const db = await getWarehouseDatabase()
    const memData = new InMemoryWarehouse()
    const dbData = new DatabaseWarehouse(db)

    const [memOrderId, dbOrderId] = await Promise.all([memData.placeOrder({ book: 2 }), dbData.placeOrder({ book: 2 })])
    const [memOrder, dbOrder] = await Promise.all([memData.getOrder(memOrderId), dbData.getOrder(dbOrderId)])

    expect(memOrder).toMatchObject(dbOrder)
    expect(dbOrder).toBeTruthy()
    if (dbOrder !== false) {
      expect(dbOrder.book).toEqual(2)
    }

    const [memOrderId2, dbOrderId2] = await Promise.all([memData.placeOrder({ book: 1 }), dbData.placeOrder({ book: 1 })])
    const [memList, dbList] = await Promise.all([memData.listOrders(), dbData.listOrders()])

    expect(memList.length).toEqual(dbList.length)
    expect(dbList.length).toEqual(2)

    await Promise.all([memData.removeOrder(memOrderId), dbData.removeOrder(dbOrderId)])
    await Promise.all([memData.removeOrder(memOrderId2), dbData.removeOrder(dbOrderId2)])

    const [memList2, dbList2] = await Promise.all([memData.listOrders(), dbData.listOrders()])

    expect(memList2.length).toEqual(dbList2.length)
    expect(dbList2.length).toEqual(0)
  })
}

export async function getDefaultWarehouseDatabase (name?: string): Promise<OrderData> {
  const db = await getWarehouseDatabase(name)
  return new DatabaseWarehouse(db)
}
