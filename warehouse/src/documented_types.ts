/**
 * A unique identifier for a particular book
 */
export type BookID = string


/**
 * The name of a shelf
 */
export type ShelfId = string

export interface Book {
    id?: BookID
    name: string
    author: string
    description: string
    price: number
    image: string
  }
  
/**
 * A unique identifier for a particular order
 */
export type OrderId = string
