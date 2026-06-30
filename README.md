# Vaidya Assist — Patient Appointment Portal

This is the patient-facing appointment portal for the Vaidya Assist clinic management system. Patients can register/log in, book appointments with doctors, view upcoming/past appointments, and chat with the health-assistant agent.

## Tech stack

- React 19 + TypeScript
- Vite
- Redux Toolkit
- MUI + MUI X Date Pickers
- Socket.IO client (for real-time chat)

## Local development

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` to `.env` and adjust:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5050/api`) |
| `VITE_AGENT_API_URL` | Agent-service API base URL (e.g. `http://localhost:4000/api`) |
| `VITE_CLINIC_ID` | Clinic UUID patients are associated with at registration |

## Build

```bash
npm run build
```

The production build is written to `dist/`.
