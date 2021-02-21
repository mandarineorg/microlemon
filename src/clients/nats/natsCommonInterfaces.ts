export interface NatsHeaderData {
    subject: string;
    sid: number;
    responseLength: number;
}
export interface NatsSubscriptionResponse {
    header: NatsHeaderData | string;
    message: string;
}