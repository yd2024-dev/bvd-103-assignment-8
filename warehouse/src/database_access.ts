import { type Collection, type Db, MongoClient } from 'mongodb'
// We are importing the book type here, so we can keep our types consistent with the front end
import { type Book } from '../../documented_types'

// This is the connection string for the mongo database in our docker compose file
// We're using process.env to detect if a different mongo uri is set, primarily for testing purpuses
const uri = (global as any).MONGO_URI as string ?? 'mongodb://mongo-warehouse'

// We're setting up a client, opening the database for our project, and then opening
// a typed collection for our books.
export const client = new MongoClient(uri)

// We're moving the setup of the database and collections into a function with a returned value,
// to allow us to isolate them in tests

