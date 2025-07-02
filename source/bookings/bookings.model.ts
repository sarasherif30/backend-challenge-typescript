export interface Booking {
  guestName: string;
  unitID: string;
  checkInDate: Date;
  numberOfNights: number;
}

export type BookingOutcome = { result: boolean; reason: string };
