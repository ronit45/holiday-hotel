# Holiday Hotel Booking

A modern, full-stack hotel booking platform built from the ground up using the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

I built this project to provide a seamless and intuitive hotel booking experience. Users can search for hotels, filter by amenities, view details, and securely book rooms.

## Features

- **User Authentication:** Secure signup and login using JWT.
- **Search & Filter:** Search for hotels by location, dates, and guests. Filter results by price, star rating, and amenities.
- **Hotel Management:** Dedicated dashboard to add, edit, and manage hotel listings (including image uploads).
- **Secure Payments:** Integrated with Stripe for safe and reliable payment processing.
- **Responsive Design:** Beautiful, mobile-first UI built with Tailwind CSS.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Query
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose
- **Integrations:** Stripe (Payments), Cloudinary (Image Hosting)

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB database
- Stripe and Cloudinary accounts

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd hotel-booking-frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd hotel-booking-backend
   npm install
   ```
4. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend folder and fill in your keys (MongoDB, Stripe, Cloudinary, JWT Secret).
   - Copy `.env.local.example` to `.env.local` in the frontend folder and add your Stripe publishable key.

### Running the App

Start the backend (runs on port 5001 by default):
```bash
cd hotel-booking-backend
npm run dev
```

Start the frontend (runs on port 5174 by default):
```bash
cd hotel-booking-frontend
npm run dev
```
