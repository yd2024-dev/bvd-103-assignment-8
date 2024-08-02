import { BookID, ShelfId } from "./documented_types";
import amqp from "amqplib";

const send = {
    removeBooksFromShelves: async (book: BookID, shelf: ShelfId, count: number) => {}
}

export async  function setupMessaging () {
    const channelName = 'remove-books-from-shelves';
    const conn = await amqp.connect("amqp://rabbitmq");

    const channel = await conn.createChannel();
    await channel.assertQueue(channelName);

    send.removeBooksFromShelves = async (book, shelf, count) => {
        channel.sendToQueue(channelName, Buffer.from(JSON.stringify({ book, shelf, count })));
    };
}

export async function removeBooksFromShelves(book: BookID, shelf: ShelfId, count: number) {
    send.removeBooksFromShelves(book, shelf, count);
}
