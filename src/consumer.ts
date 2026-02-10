import { Resource } from "sst";
import { SQSEvent } from "aws-lambda";
import { AppEventSchema, processEvent } from "./schemas";

export const handler = async (event: SQSEvent) => {
    const discordUrl = (Resource as any).DiscordWebhookUrl.value;

    if (!discordUrl) {
        console.error("❌ CRITICAL: Discord Secret is MISSING.");
        return;
    }

    for (const record of event.Records) {
        try {
            const rawBody = JSON.parse(record.body);
            const parsed = AppEventSchema.safeParse(rawBody);

            if (!parsed.success) {
                console.warn("⚠️ Invalid Event Schema:", parsed.error);
                continue;
            }

            const validEvent = parsed.data;

            const message = processEvent(validEvent);

            const response = await fetch(discordUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: message }),
            });

            if (!response.ok) {
                console.error(`❌ Discord API Error: ${response.status}`);
            } else {
                console.log(`✅ SUCCESS: Processed ${validEvent.kind} event.`);
            }

        } catch (error) {
            console.error("🔥 HANDLER CRASHED on record:", error);
        }
    }
};