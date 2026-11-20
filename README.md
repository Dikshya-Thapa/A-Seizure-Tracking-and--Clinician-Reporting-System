# A Seizure Tracking and Clinician Reporting System

A web-based application for patients and caregivers to manage epilepsy across all age groups.

| | |
|---|---|
| **Module** | Project and Professionalism (6CS007) |
| **Institution** | Herald College Kathmandu / University of Wolverhampton |
| **Student** | Dikshya Thapa (2501600), Group L6CG9 |
| **Supervisor** | Javed Khan |

## About the project

Epilepsy care depends on accurate records of seizures and medication, but patients and caregivers often rely on memory during short consultations, so doctors receive incomplete information.

This project is a Progressive Web Application (PWA) in which a patient, or a caregiver acting for a dependent, logs seizures and medication, receives reminders, and generates a statistically cautious summary report that is sent to a doctor's account. The doctor reviews the report and replies through the same application. The patient or caregiver can then book an appointment, pay for it, and attend it by video call.

The application is designed for people of all ages: adults managing their own epilepsy, and caregivers of children, elderly relatives or other dependents.

## Planned features

- Seizure logging with an emergency timer and first-aid guidance, usable offline
- Medication reminders with escalation, and adherence tracking
- Trigger analytics with statistical safeguards (minimum sample size, confidence intervals, multiple-comparison correction)
- PDF report generation and secure sharing with doctors
- Doctor portal with report inbox and messaging
- Appointment booking, payment (Khalti sandbox) and video consultation (Jitsi)
- Awareness and education content
- Email OTP login and role-based access control
- No-flashing interface by default (WCAG 2.3.1)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), PWA with service worker and IndexedDB |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Background jobs | Redis, BullMQ |
| External services | Khalti ePayment (sandbox), Jitsi |

## Project structure

```text
frontend/   React client (src/api, src/components, src/pages)
backend/    Express API (config, models, routes, controllers, middleware)
```

## Getting started

**Requirements:** Node.js and Git.

### 1. Clone the repository

```powershell
git clone https://github.com/Dikshya-Thapa/A-Seizure-Tracking-and--Clinician-Reporting-System.git
cd A-Seizure-Tracking-and--Clinician-Reporting-System
```

### 2. Run the backend

```powershell
cd backend
npm install
```

Create a `.env` file in `backend/` using `.env.example` as a guide, then start the server:

```powershell
node index.js
```

The API runs on `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

### 3. Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Environment variables

Secrets are kept in `backend/.env`, which is not committed to Git. `backend/.env.example` lists the variables the backend needs.

| Variable | Purpose |
|---|---|
| `PORT` | Port the API runs on (default 5000) |
| `MONGO_URI` | MongoDB connection string |

More variables (for example email, authentication and payment keys) will be added as those features are built.

## Project status

In early development. The project structure is set up and features are being built in stages, following the project plan (nine months).

## Data and privacy

No real patient data is stored in this repository. Testing and evaluation use synthetic data and consenting volunteers only. Payment is handled by the payment gateway's own page, and card details are never stored by the application.

## Licence

Developed for academic assessment. All rights reserved by the author unless stated otherwise.