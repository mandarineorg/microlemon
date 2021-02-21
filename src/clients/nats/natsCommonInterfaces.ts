export interface NatsHeaderData {
    subject: string;
    sid: number;
    responseLength: number;
}
export interface NatsSubscriptionResponse {
    type: string;
    header: NatsHeaderData | string;
    message: string;
}