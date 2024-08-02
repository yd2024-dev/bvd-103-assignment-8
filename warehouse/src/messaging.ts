import { BookID, ShelfId } from "../../documented_types";
import amqp from "amqplib";
import { removeBooksFromShelves } from "./remove_from_shelf";
import { WarehouseData } from "./warehouse_data";
import timers from "node:timers/promises";


export async  function setupMessaging (data: WarehouseData) {
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

    await channel.consume(channelName, async (msg) => {
        console.log("Got Message");
        if (msg !== null) {
            let json = msg.content.toString();
            console.log("MESSAGE: ", json);
            let { book, shelf, count} = JSON.parse(json);
            if (typeof book === "string" && typeof shelf === "string" && typeof count === "number") {
                console.log("REMOVING");
                await removeBooksFromShelves(data, book, shelf, count);
            }
        }
    })
}
