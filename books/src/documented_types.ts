/**
 * A unique identifier for a particular book
 */
export type BookID = string

export interface Book {
  id?: BookID
  name: string
  author: string
  description: string
  price: number
  image: string
}

export interface Filter {
  from?: number
  to?: number
  name?: string
  author?: string
};
