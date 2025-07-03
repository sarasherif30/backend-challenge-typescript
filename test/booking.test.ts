import axios, { AxiosError } from 'axios';
import { startServer, stopServer } from '../source/server';
import { PrismaClient } from '@prisma/client';

const GUEST_A_UNIT_1 = {
  unitID: '1',
  guestName: 'GuestA',
  checkInDate: new Date().toISOString().split('T')[0],
  numberOfNights: 5
};

const GUEST_A_UNIT_2 = {
  unitID: '2',
  guestName: 'GuestA',
  checkInDate: new Date().toISOString().split('T')[0],
  numberOfNights: 5
};

const GUEST_B_UNIT_1 = {
  unitID: '1',
  guestName: 'GuestB',
  checkInDate: new Date().toISOString().split('T')[0],
  numberOfNights: 5
};

const prisma = new PrismaClient();

beforeEach(async () => {
  // Clear any test setup or state before each test
  await prisma.booking.deleteMany();
});

beforeAll(async () => {
  await startServer();
});

afterAll(async () => {
  await prisma.$disconnect();
  await stopServer();
});

describe('Booking API', () => {

  describe('Create Booking', () => {
    test('Create fresh booking', async () => {
      const response = await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_1);

      expect(response.status).toBe(201);
      expect(response.data.guestName).toBe(GUEST_A_UNIT_1.guestName);
      expect(response.data.unitID).toBe(GUEST_A_UNIT_1.unitID);
      expect(response.data.numberOfNights).toBe(GUEST_A_UNIT_1.numberOfNights);
    });
    test('Missing required fields: unitID', async () => {
      let error: any;
      try {
        await axios.post('http://localhost:8000/api/v1/booking', {
          guestName: 'GuestA',
          checkInDate: new Date().toISOString().split('T')[0],
          numberOfNights: 5
        });
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(400);
      expect(error.response.data).toMatch(/unitID/);
    });

    test('Missing required fields: checkInDate', async () => {
      let error: any;
      try {
        await axios.post('http://localhost:8000/api/v1/booking', {
          guestName: 'GuestA',
          unitID: '1',
          numberOfNights: 5
        });
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(400);
      expect(error.response.data).toMatch(/checkInDate/);
    });

    test('Missing required fields: numberOfNights', async () => {
      let error: any;
      try {
        await axios.post('http://localhost:8000/api/v1/booking', {
          guestName: 'GuestA',
          unitID: '1',
          checkInDate: new Date().toISOString().split('T')[0]
        });
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(400);
      expect(error.response.data).toMatch(/numberOfNights/);
    });

    test('Same guest same unit booking', async () => {
      // Create first booking
      const response1 = await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_1);
      expect(response1.status).toBe(201);
      expect(response1.data.guestName).toBe(GUEST_A_UNIT_1.guestName);
      expect(response1.data.unitID).toBe(GUEST_A_UNIT_1.unitID);

      // Guests want to book the same unit again
      let error: any;
      try {
        await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_1);
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(400);
      expect(error.response.data).toEqual('The given guest name cannot book the same unit multiple times');
    });

    test('Same guest different unit booking at the same time', async () => {
      // Create first booking
      const response1 = await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_1);
      expect(response1.status).toBe(201);
      expect(response1.data.guestName).toBe(GUEST_A_UNIT_1.guestName);
      expect(response1.data.unitID).toBe(GUEST_A_UNIT_1.unitID);

      // Guest wants to book another unit
      let error: any;
      try {
        await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_2);
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(400);
      expect(error.response.data).toEqual('The same guest cannot be in multiple units at the same time');
    });

    test('Different guest same unit booking', async () => {
      // Create first booking
      const response1 = await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_1);
      expect(response1.status).toBe(201);
      expect(response1.data.guestName).toBe(GUEST_A_UNIT_1.guestName);
      expect(response1.data.unitID).toBe(GUEST_A_UNIT_1.unitID);

      // GuestB trying to book a unit that is already occupied
      let error: any;
      try {
        await axios.post('http://localhost:8000/api/v1/booking', GUEST_B_UNIT_1);
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(400);
      expect(error.response.data).toEqual('For the given check-in date, the unit is already occupied');
    });

    test('Different guest same unit booking different date', async () => {
      // Create first booking
      const response1 = await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_1);
      expect(response1.status).toBe(201);
      expect(response1.data.guestName).toBe(GUEST_A_UNIT_1.guestName);

      // GuestB trying to book a unit that is already occupied
      let error: any;
      try {
        await axios.post('http://localhost:8000/api/v1/booking', {
          unitID: '1',
          guestName: 'GuestB',
          checkInDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          numberOfNights: 5
        });
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(400);
      expect(error.response.data).toEqual('For the given check-in date, the unit is already occupied');
    });
  });

  describe('Extend Booking', () => {
    test('Extend booking with zero numberOfNights', async () => {
      // Create a valid booking first
      const response = await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_1);
      let error: any;
      try {
        await axios.patch(`http://localhost:8000/api/v1/booking/${response.data.id}`, {
          numberOfNights: 0
        });
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(AxiosError);
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toMatch(/Invalid number of extra nights/);
    });

    test('Extend number of nights for the same booking', async () => {
      // Create first booking
      const response1 = await axios.post('http://localhost:8000/api/v1/booking', GUEST_A_UNIT_1);
      expect(response1.status).toBe(201);
      expect(response1.data.guestName).toBe(GUEST_A_UNIT_1.guestName);

      // Extend the booking
      const res = await axios.patch(`http://localhost:8000/api/v1/booking/${response1.data.id}`, {
        numberOfNights: 2
      });

      expect(res.status).toBe(200);
      expect(res.data.numberOfNights).toBe(7);
    });
  });
});
