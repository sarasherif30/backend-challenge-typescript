# Backend Challenge - TypeScript

## Context

We would like you to help us with a small service that we have for handling bookings. A booking for us simply tells us which guest will be staying in which unit, and when they arrive and the number of nights that guest will be enjoying our amazing suites, comfortable beds, great snac.. apologies - I got distracted. Bookings are at the very core of our business and it's important that we get these right - we want to make sure that guests always get what they paid for, and also trying to ensure that our unit are continually booked and have as few empty nights where no-one stays as possible. A unit is simply a location that can be booked, think like a hotel room or even a house. For the exercise today, we would like you to help us solve an issue we've been having with our example service, as well as implement a new feature to improve the code base. While this is an opportunity for you to showcase your skills, we also want to be respectful of your time and suggest spending no more than 3 hours on this (of course you may also spend longer if you feel that is necessary)

### You should help us:

- Identify and fix a bug that we've been having with bookings - there seems to be something going wrong with the booking process where a guest will arrive at a unit only to find that it's already booked and someone else is there!
- There are many ways to solve this bug - there is no single correct answer that we are looking for.

### Implement a new feature:

- Allow guests to extend their stays if possible. Sometimes people love staying at our locations so much that they want to extend their stay and remain there a while longer. We've added a new API that lets them do that.

---

## Features

- **Create Booking:** Guests can book a unit for a specific date and number of nights.
- **Extend Booking:** Guests can extend their stay if the unit is available.
- **Validation:** The API checks for missing fields, invalid data types, and prevents double-booking or overlapping stays.
- **Swagger Documentation:** API is documented and available at `/api-docs`.
- **Comprehensive Tests:** Includes tests for booking creation, extension, validation, and edge cases.

---

## Project Structure

- `source/` - Main application source code.
- `source/bookings` - Contains all booking-related logic, including:
  - `bookings.controller.ts` – Handles HTTP requests and responses for bookings.
  - `bookings.service.ts` – Contains business logic for creating, extending bookings.
  - `bookings.model.ts` – Defines interfaces and types for bookings.
  - `bookings.route.ts` – Sets up Express routes for booking endpoints.
- `source/utils` - Utility functions used across bookings.
- `test/` - Test cases for the API.
- `swagger.json` - OpenAPI documentation.

---

## How to run

### Prerequisites

Make sure to have the following installed:

- npm

### Setup

To get started, clone the repository locally and run the following:

```shell
./init.sh
```

To make sure that everything is setup properly, open [http://localhost:8000](http://localhost:8000) in your browser and you should see an OK message.
The logs should look like this:

```shell
The server is running on http://localhost:8000
GET / 200 3.088 ms - 16
```

To navigate to the swagger docs, open the url [http://localhost:8000/api-docs/](http://localhost:8000/api-docs/)

---

### Running tests

There are comprehensive tests covering booking creation, extension, and validation.
To run the tests:

```shell
npm run test
```

Example output:

```shell
PASS  test/booking.test.ts
  Booking API
    Create Booking
      ✓ Create fresh booking (58 ms)
      ✓ Missing required fields: unitID (11 ms)
      ✓ Missing required fields: checkInDate (7 ms)
      ✓ Missing required fields: numberOfNights (4 ms)
      ✓ Same guest same unit booking (14 ms)
      ✓ Same guest different unit booking at the same time (15 ms)
      ✓ Different guest same unit booking (12 ms)
      ✓ Different guest same unit booking different date (15 ms)
    Extend Booking
      ✓ Extend booking with zero numberOfNights (9 ms)
      ✓ Extend number of nights for the same booking (12 ms)
Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.003 s
Ran all test suites.
```

---

### Enhancement:

- To further optimize solution for handling cases where different guests book the same unit on different dates, consider the following architectural improvement:

  - Instead of calculating the check-out date dynamically in your service logic, persist a `checkoutDate` field in Prisma schema at the time of booking creation or extension, so the benefits:
    - **Performance:** Offloads date calculations to the database, allowing for efficient indexed range queries.

    - **Maintainability:** Makes future enhancements (e.g., reporting, analytics) easier, as all relevant dates are stored.

> Note: Due to time constraints, I was not able to add unit tests for every controller and service file in the `bookings` folder. However, there are comprehensive tests covering the main booking flows and validation logic.

---
