import { Booking } from './bookings.model';
import prisma from '../prisma';
import { isBookingPossible, computeDateWithNights } from '../utils/bookingUtils';

export class BookingsService {
  async createBooking(bookingData: Booking): Promise<Booking> {
    const requiredFields = ['guestName', 'unitID', 'checkInDate', 'numberOfNights'];
    const missingFields = requiredFields.filter((field) => !bookingData[field as keyof Booking]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required field(s): ${missingFields.join(', ')}`);
    }

    let outcome = await isBookingPossible(bookingData);
    if (!outcome.result) {
      throw new Error(outcome.reason);
    }

    const newBooking = await prisma.booking.create({
      data: {
        guestName: bookingData.guestName,
        unitID: bookingData.unitID,
        checkInDate: new Date(bookingData.checkInDate),
        numberOfNights: bookingData.numberOfNights
      }
    });

    return newBooking;
  }

  async extendBooking(bookingId: number, extraNights: number): Promise<Booking> {
    if (!extraNights || extraNights <= 0) {
      throw new Error('Invalid number of extra nights');
    }

    const booking: Booking | null = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const originalCheckOut = computeDateWithNights(booking.checkInDate, booking.numberOfNights);
    const newNights = booking.numberOfNights + extraNights;
    const newCheckOutDate = computeDateWithNights(booking.checkInDate, newNights);

    const overlappingBookings = await prisma.booking.findMany({
      where: {
        AND: {
          id: { not: bookingId },
          checkInDate: {
            lt: newCheckOutDate
          },
          unitID: {
            equals: booking.unitID
          }
        }
      }
    });

    // Filter bookings that overlap with the new check-out date
    const conflictBooking = overlappingBookings.find((existing: { checkInDate: Date; numberOfNights: number }) => {
      const extendedCheckOut = computeDateWithNights(existing.checkInDate, existing.numberOfNights);
      return extendedCheckOut > originalCheckOut;
    });

    if (conflictBooking) {
      throw new Error('Extension conflicts with another booking');
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: { numberOfNights: newNights }
    });
  }
}
