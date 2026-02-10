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
});

export type IssueEvent = z.infer<typeof IssueEventSchema>;
