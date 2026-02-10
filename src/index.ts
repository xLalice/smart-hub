import { IssueEventSchema } from "./schemas";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Resource } from "sst";

const sqs = new SQSClient({});

export const handler = async (event: any) => {
    console.log("Event received:", event);
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing body" })
        }
    }


    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Invalid JSON payload"
            })
        }
    };

    const parsedEvent = IssueEventSchema.safeParse(body);

    if (!parsedEvent.success) {
        console.error("Validation Failed:", parsedEvent.error);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Invalid payload",
                details: parsedEvent.error.issues
            }),
        };
    }

    const validEvent = parsedEvent.data;

    try {
        const command = new SendMessageCommand({
            QueueUrl: (Resource as any).MyQueue.url,

            MessageBody: JSON.stringify(validEvent),
        });

        await sqs.send(command);

        console.log("Sent to queue successfully");
    } catch (error) {
        console.error("Failed to queue message:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            status: 'alive',
            message: `Processed issue: ${validEvent.issue.title}`,
        })
    }
}