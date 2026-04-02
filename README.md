# AI Interview Practice Platform

An interview preparation web app built with React, TypeScript, Express, Firebase, and Gemini AI. Users can sign in, choose a target role, generate interview questions, answer them one by one, and get AI-based feedback with scoring and improvement suggestions.

## About The Project

This project was built to simulate a realistic interview preparation experience with AI-generated question sets and instant feedback. It combines a modern React frontend with an Express backend, Firebase for authentication and persistence, and Gemini AI for question generation and answer evaluation.

The goal of the project is to help users practice interviews in a structured way while also demonstrating full-stack development skills, API integration, authentication, state management, and cloud database usage.

## Key Highlights

- Built a full-stack AI interview simulator using React, TypeScript, Express, Firebase, and Gemini
- Designed a guided interview workflow with timed questions and answer-by-answer evaluation
- Integrated Firebase Authentication and Firestore for user and session management
- Secured Gemini API usage through backend API routes instead of exposing secrets in the frontend
- Structured the project for local development and future cloud deployment

## Features

- User authentication with Firebase
- Role-based interview question generation
- Technical, HR, and system design interview modes
- Difficulty selection for practice sessions
- Timed interview flow
- AI evaluation with score, strengths, improvements, and feedback
- Session data stored in Firestore

## Tech Stack

- React
- TypeScript
- Vite
- Express
- Firebase Authentication
- Firestore
- Gemini API
- Tailwind CSS

## Project Structure

```text
src/
  components/        UI screens
  context/           authentication state
  services/          frontend API helpers
  firebase.ts        Firebase setup
server.ts            Express server and Gemini API routes
```

## Getting Started

### Prerequisites

- Node.js
- A Gemini API key
- A Firebase project

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Deepika-saravanan-tech/ai-interview.git
cd ai-interview
```

2. Install dependencies:

```bash
npm install
```

3. Create a local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

4. Update `.env.local` with your values:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

5. Start the development server:

```bash
npm run dev
```

6. Open the app in your browser:

```text
http://localhost:3000
```

## How It Works

- The frontend sends requests to Express API routes
- The Express server securely calls Gemini using the API key from `.env.local`
- Firebase handles authentication and stores interview session data

## Demo

- GitHub Repository: [ai-interview](https://github.com/Deepika-saravanan-tech/ai-interview)
- Local Demo URL: `http://localhost:3000`

If you deploy the project later, you can replace this section with a public live demo link.

## Environment Variables

The app uses these local environment variables:

- `GEMINI_API_KEY` - Gemini API key used by the server
- `APP_URL` - local or deployed app URL

## Future Improvements

- Add recruiter-ready demo deployment
- Add speech-to-text mock interviews
- Add interview history dashboard
- Add resume-based question generation
- Add exportable result reports

## Recruiter Notes

This project demonstrates:

- Full-stack application development
- REST API integration
- Secure environment variable handling
- Authentication and database integration with Firebase
- AI-assisted product workflows
- Responsive UI development with React and Tailwind CSS

## Author

Deepika Saravanan

## Contact

- GitHub: [Deepika-saravanan-tech](https://github.com/Deepika-saravanan-tech)
