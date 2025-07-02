import express, { Router } from 'express';
import { BookingsController } from './bookings.controller';

export class BookingsRoute {
  private router: Router;
  private controller: BookingsController;

  constructor() {
    this.router = express.Router();
    this.controller = new BookingsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.controller.healthCheck);
    this.router.post('/api/v1/booking/', this.controller.createBooking.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}
