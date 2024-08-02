import { type ShelfId, type BookID, type OrderId } from '../../documented_types'
import { InMemoryWarehouse, type WarehouseData } from './warehouse_data'

export async function removeBooksFromShelves ( data: WarehouseData, book: BookID, shelf: ShelfId, numberOfBooks: number): Promise<void> {

    const currentCopiesOnShelf = await data.getCopiesOnShelf(book, shelf)
    const newCopiesOnShelf = currentCopiesOnShelf - numberOfBooks
    if (newCopiesOnShelf < 0) {
      throw new Error('not enough copies on given shelves')
    }
    console.log("REMOVING CORRECTLY")
    await data.placeBookOnShelf(book, shelf, numberOfBooks)
    console.log("REMOVED!")
}
