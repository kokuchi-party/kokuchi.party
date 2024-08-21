interface TicketBase {
  type: string;
  primary: boolean;
  price: number;
  additionalFee?:
    | {
        name: number;
        price: number;
      }
    | undefined;
  url?: string | undefined;
}

export interface SameDayTicket extends TicketBase {
  type: "same-day";
}

export interface AdvanceTicket extends TicketBase {
  type: "advance";
  url: string;
}

export interface CustomTicket extends TicketBase {
  type: "custom";
  name: string;
}

export type Ticket = SameDayTicket | AdvanceTicket | CustomTicket;

export type PrimaryTicket = Ticket & { primary: true };

export type AdditionalTicket = Ticket & { primary: false };
