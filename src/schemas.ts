import { z } from 'zod';

export const IssueEventSchema = z.object({
    action: z.literal("opened", "Only accepts opened events"),
    issue: z.object({
        url: z.string(),
        html_url: z.string(),
        id: z.number(),
        title: z.string(),
        user: z.object({
            login: z.string(),
            id: z.number()
        }),
        body: z.string().nullable().optional(),
        number: z.number()
    }),
    repository: z.object({
        id: z.number(),
        full_name: z.string(),
        private: z.boolean()
    }),
    sender: z.object({
        login: z.string()
    })
}).transform((obj) => {
    return {
        ...obj,
        kind: 'github' as const
    }
});

export const ManualTriggerSchema = z.object({
    kind: z.literal("manual"),
    message: z.string(),
    priority: z.enum(["low", "high", "critical"])
});

export const AppEventSchema = z.union([ManualTriggerSchema, IssueEventSchema]);

export type IssueEvent = z.infer<typeof IssueEventSchema>;
export type ManualTriggerEvent = z.infer<typeof ManualTriggerSchema>;

export type AppEvent = IssueEvent | ManualTriggerEvent;

export const processEvent = (event: AppEvent): string => {
    switch(event.kind) {
        case 'github':
            return `🚨 **GitHub Alert**\n**Repo:** ${event.repository.full_name}\n**User:** ${event.issue.user.login}\n**Action:** ${event.action} issue #${event.issue.number}\n**Link:** <${event.issue.html_url}>`;
        
        case 'manual':
            const emoji = event.priority === 'critical' ? '🔥' : 'ℹ️';
            return `${emoji} **Manual Alert**\n**Priority:** ${event.priority.toUpperCase()}\n**Message:** ${event.message}`;
        
        default:
            const _exhaustiveCheck: never = event;
            return _exhaustiveCheck;
    }
};