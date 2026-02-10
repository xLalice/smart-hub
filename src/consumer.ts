import { Resource } from "sst";

export const handler = async (event: any) => {
  const discordUrl = (Resource as any).DiscordWebhookUrl.value;
  if (!discordUrl) {
    console.error("❌ CRITICAL: Discord Secret is MISSING or UNDEFINED.");
    return;
  }
  console.log("✅ Secret loaded (Length: " + discordUrl.length + ")");

  for (const record of event.Records) {
    try {
      console.log("📩 Processing Record Body:", record.body);
      
      const body = JSON.parse(record.body);
      
      if (!body.issue || !body.repository) {
        console.warn("⚠️ SKIPPING: Event missing 'issue' or 'repository' fields.", body);
        continue; 
      }

      const { action, issue, repository } = body;
      const message = `🚨 **GitHub Alert**\n**Repo:** ${repository.full_name}\n**User:** ${issue.user.login}\n**Action:** ${action} issue #${issue.number}\n**Link:** <${issue.html_url}>`;

      const response = await fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Discord API Error: ${response.status} - ${errorText}`);
      } else {
        console.log("✅ SUCCESS: Message sent to Discord.");
      }

    } catch (error) {
      console.error("🔥 HANDLER CRASHED on record:", error);
    }
  }

  return {};
};