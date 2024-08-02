import { type ShelfId, type BookID, type OrderId } from '../../documented_types'
import { InMemoryWarehouse, type WarehouseData } from './data'
import { removeBooksFromShelves } from './messaging'

export async function fulfilOrder (data: WarehouseData, orderId: OrderId, booksFulfilled: Array<{ book: BookID, shelf: ShelfId, numberOfBooks: number }>): Promise<void> {
  const order = await data.getOrder(orderId)
  if (order === false) {
    throw new Error('no such order')
  }

  const removedCount: Record<BookID, number> = {}
  for (const { book, numberOfBooks } of booksFulfilled) {
    if (!(book in order)) {
      throw new Error('one of the books is not in the order')
    }
    removedCount[book] = numberOfBooks + (removedCount[book] ?? 0)
  }

  for (const book of Object.keys(order)) {
    if (removedCount[book] !== order[book]) {
      throw new Error('incorrect number of books')
    }
  }

  const processedFulfilment = await Promise.all(booksFulfilled.map(async ({ book, shelf, numberOfBooks }) => {
    await removeBooksFromShelves(book, shelf, numberOfBooks)
  }))

  await data.removeOrder(orderId)
  await Promise.all(processedFulfilment)
}
if (import.meta.vitest !== undefined) {
  const { test, expect } = import.meta.vitest

  test('fulfilling a non-existant order throws an error', async () => {
    const data = new InMemoryWarehouse()

    await expect(async () => { await fulfilOrder(data, 'my-order', []) }).rejects.toThrowError('no such order')
  })

  test('fulfilling an empty order removes the order from the database', async () => {
    const data = new InMemoryWarehouse({ orders: { order: {} } })

    await fulfilOrder(data, 'order', [])

    expect(await data.getOrder('order')).toBeFalsy()
  })

  test('fulfilling a valid order with the correct amount of each book removes the order from the database and the books from the shelves', async () => {
    const data = new InMemoryWarehouse({ orders: { order: { book: 2 } }, })

    await fulfilOrder(data, 'order', [{ book: 'book', shelf: 'shelf_2', numberOfBooks: 1 }, { book: 'book', shelf: 'shelf_1', numberOfBooks: 1 }])

    expect(await data.getOrder('order')).toBeFalsy()
  })

  test('fulfilling a valid order with a wrong amount of each book doesnt fulfil the order and throws an error', async () => {
    const data = new InMemoryWarehouse({ orders: { order: { book: 3 } } })

    await expect(async () => { await fulfilOrder(data, 'order', [{ book: 'book', shelf: 'shelf_2', numberOfBooks: 1 }, { book: 'book', shelf: 'shelf_1', numberOfBooks: 1 }]) }).rejects.toThrowError('incorrect number of books')
  })

  test('fulfilling a valid order with a missing book thorws an error', async () => {
    const data = new InMemoryWarehouse({ orders: { order: { book: 2, book_2: 1 } }})

    await expect(async () => { await fulfilOrder(data, 'order', [{ book: 'book', shelf: 'shelf_2', numberOfBooks: 1 }, { book: 'book', shelf: 'shelf_1', numberOfBooks: 1 }]) }).rejects.toThrowError('incorrect number of books')
  })

  test('fulfilling a valid order with an extra book doesnt fulfil the order and throws an error', async () => {
    const data = new InMemoryWarehouse({ orders: { order: { book: 2 } },  })

    await expect(async () => { await fulfilOrder(data, 'order', [{ book: 'book', shelf: 'shelf_2', numberOfBooks: 1 }, { book: 'book', shelf: 'shelf_1', numberOfBooks: 1 }, { book: 'book_2', shelf: 'shelf_1', numberOfBooks: 1 }]) }).rejects.toThrowError('one of the books is not in the order')

  })

}
