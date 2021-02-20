import type { Header, ReceiveMethod, SendMethod } from "./amqp_codec.ts";

export interface HeaderFrame {
  type: "header";
  channel: number;
  payload: Header;
}

export interface IncomingMethodFrame {
  type: "method";
  channel: number;
  payload: ReceiveMethod;
}

export interface OutgoingMethodFrame {
  type: "method";
  channel: number;
  payload: SendMethod;
}

export interface ContentFrame {
  type: "content";
  channel: number;
  payload: Uint8Array;
}

export interface HeartbeatFrame {
  type: "heartbeat";
  channel: number;
  payload: Uint8Array;
}

export type IncomingFrame =
  | HeaderFrame
  | HeartbeatFrame
  | IncomingMethodFrame
  | ContentFrame;

export type OutgoingFrame =
  | HeaderFrame
  | HeartbeatFrame
  | OutgoingMethodFrame
  | ContentFrame;
