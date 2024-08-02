import { BookID, type Book } from "./documented_types";
import amqp from "amqplib";

const send = {
    bookCreatedOrUpdated: async (book: Book) => {},
    bookDeleted: async (book: BookID) => {}
}

export async  function setupMessaging () {
    const channelName = 'books';
    const conn = await amqp.connect("amqp://rabbitmq");

    const channel = await conn.createChannel();
    await channel.assertExchange(channelName, "topic", { durable: false});

    send.bookCreatedOrUpdated = async (book) => {
        channel.publish(channelName, '', Buffer.from(JSON.stringify({ created: book })));
    };

    send.bookDeleted = async (book) => {
        channel.publish(channelName, '', Buffer.from(JSON.stringify({deleted: book})));
    }
}

export async function bookCreatedOrUpdated(book: Book) {
    send.bookCreatedOrUpdated(book);
}

export async function bookDeleted(book: BookID) {
    send.bookDeleted(book);
}