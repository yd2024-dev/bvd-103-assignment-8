import { BookID, ShelfId } from "../../documented_types";
import amqp from "amqplib";
import timers from "node:timers/promises";

const send = {
    removeBooksFromShelves: async (book: BookID, shelf: ShelfId, count: number) => {}
}

export async  function setupMessaging () {
    const channelName = 'remove-books-from-shelves';
    const conn = await new Promise<amqp.Connection>(async (resolve, reject) => {
        for (let i = 0; i < 10; i++) {
            try {
                let result = await amqp.connect("amqp://rabbitmq");
                return resolve(result);
            } catch (e) {
                await timers.setTimeout(1000);
            }
        }
        console.error("Couldn't connect in time");
        reject("Couldn't connect in time");
    });

    const channel = await conn.createChannel();
    await channel.assertQueue(channelName);

    send.removeBooksFromShelves = async (book, shelf, count) => {
        console.log("SENDING - Remove From Shelf", { book, shelf, count});
        channel.sendToQueue(channelName, Buffer.from(JSON.stringify({ book, shelf, count })));
    };
}

export async function removeBooksFromShelves(book: BookID, shelf: ShelfId, count: number) {
    send.removeBooksFromShelves(book, shelf, count);
}
