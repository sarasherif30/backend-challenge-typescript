import { Booking, BookingOutcome } from "../bookings/bookings.model";
import prisma from "../prisma";

export async function isBookingPossible(booking: Booking): Promise<BookingOutcome> {
    // check 1 : The Same guest cannot book the same unit multiple times
    let sameGuestSameUnit = await prisma.booking.findMany({
      where: {
        AND: {
          guestName: {
            equals: booking.guestName
          },
          unitID: {
            equals: booking.unitID
          }
        }
      }
    });
    if (sameGuestSameUnit.length > 0) {
      return { result: false, reason: 'The given guest name cannot book the same unit multiple times' };
    }

    // check 2 : the same guest cannot be in multiple units at the same time
    let sameGuestAlreadyBooked = await prisma.booking.findMany({
      where: {
        AND: {
          guestName: {
            equals: booking.guestName
          }
        }
      }
    });

    if (sameGuestAlreadyBooked.length > 0) {
      return { result: false, reason: 'The same guest cannot be in multiple units at the same time' };
    }

    // check 3 : Unit is available for the check-in date
    const checkOutDate = computeDateWithNights(new Date(booking.checkInDate), booking.numberOfNights);
    let isUnitAvailableOnCheckInDate = await prisma.booking.findMany({
      where: {
        AND: {
          checkInDate: {
            lt: checkOutDate
          },
          unitID: {
            equals: booking.unitID
          }
        }
      }
    });

    const overlappingBookings = isUnitAvailableOnCheckInDate.filter(
      (existing: { checkInDate: Date; numberOfNights: number }) => {
        const checkOutDate = computeDateWithNights(existing.checkInDate, existing.numberOfNights);
        return checkOutDate > existing.checkInDate;
      }
    );

    if (overlappingBookings.length > 0) {
      return { result: false, reason: 'For the given check-in date, the unit is already occupied' };
    }

    return { result: true, reason: 'OK' };
}
  
export function computeDateWithNights(date: Date, nights: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + nights);
  return result;
}