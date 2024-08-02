import { BookID, ShelfId } from "./documented_types";
import amqp from "amqplib";
import { removeBooksFromShelves } from "./remove_from_shelf";
import { WarehouseData } from "./warehouse_data";


export async  function setupMessaging (data: WarehouseData) {
    const channelName = 'remove-books-from-shelves';
    const conn = await amqp.connect("amqp://rabbitmq");

    const channel = await conn.createChannel();
    await channel.assertQueue(channelName);

    channel.consume(channelName, (msg) => {
        if (msg !== null) {
            let json = msg.content.toString();
            let { book, shelf, numberOfBooks} = JSON.parse(json);
            if (typeof book === "string" && typeof shelf === "string" && typeof numberOfBooks === "number") {
                removeBooksFromShelves(data, book, shelf, numberOfBooks);
            }
        }
    })
}
