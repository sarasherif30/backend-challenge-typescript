import { Request, Response } from 'express';
import { BookingsService } from './bookings.service';
import { Booking } from './bookings.model';

export class BookingsController {
  private bookingsService: BookingsService;

  constructor() {
    this.bookingsService = new BookingsService();
  }

  healthCheck = async (req: Request, res: Response) => {
    return res.status(200).json({
      message: 'OK'
    });
  };

  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingData: Booking = req.body;
      const newBooking = await this.bookingsService.createBooking(bookingData);
      res.status(201).json(newBooking);
    } catch (error: any) {
      res.status(400).json(error.message);
    }
  }

  async extendBooking(req: Request, res: Response): Promise<void> {
    const bookingId = Number(req.params.id);
    const { numberOfNights }: { numberOfNights: number } = req.body;

    try {
      const updatedBooking = await this.bookingsService.extendBooking(bookingId, numberOfNights);
      res.status(200).json(updatedBooking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
