export interface Webhook {
    id: string;
    url: string;
    events: string[];
    status: string;
}