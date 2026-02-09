import {  IssueEventSchema } from "./schemas";

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

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            status: 'alive',
            message: `Processed issue: ${validEvent.issue.title}`,
        })
    }
}