# AI Interview Practice Platform

An interview preparation web app built with React, TypeScript, Express, Firebase, and Gemini AI. Users can sign in, choose a target role, generate interview questions, answer them one by one, and get AI-based feedback with scoring and improvement suggestions.

## About The Project

This project was built to simulate a realistic interview preparation experience with AI-generated question sets and instant feedback. It combines a modern React frontend with an Express backend, Firebase for authentication and persistence, and Gemini AI for question generation and answer evaluation.

The goal of the project is to help users practice interviews in a structured way while also demonstrating full-stack development skills, API integration, authentication, state management, and cloud database usage.

## Project Idea

The main idea behind this project is to create an AI-powered interview practice platform that feels more like a guided mock interview than a simple question list. Instead of only showing static questions, the application generates interview questions based on role, interview type, and difficulty level, then evaluates the user's answers with structured feedback.

This project was created to solve two problems:

- many learners do not have access to realistic interview practice
- users need actionable feedback, not just a list of sample questions

The platform helps users practice regularly, review past performance, and understand how their communication, technical clarity, and response quality improve over time.

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
- Live Demo: [ai-interview-wp5v.onrender.com](https://ai-interview-wp5v.onrender.com)

If you deploy the project later, you can replace this section with a public live demo link.

## Website Screenshots

You can add your project screenshots in the repository and display them here. A good set of screenshots for this project would be:

- Login page
- Start interview page
- Interview question page
- Result page
- History / progress page

Recommended screenshot folder structure:

```text
docs/screenshots/login.png
docs/screenshots/home.png
docs/screenshots/interview.png
docs/screenshots/result.png
docs/screenshots/history.png
```

After adding the images, you can show them in this README like this:

```md
![Login Screen](docs/screenshots/login.png)
![Start Interview Screen](docs/screenshots/home.png)
![Interview Screen](docs/screenshots/interview.png)
![Result Screen](docs/screenshots/result.png)
![History Screen](docs/screenshots/history.png)
```

## How To Explain This Project In An Interview

You can explain the project like this:

> I built an AI interview practice platform that helps users prepare for interviews in a structured and interactive way. Users can choose a target role, interview type, and difficulty, then the system generates interview questions using Gemini AI. After each answer, the app evaluates the response and provides a score, strengths, improvement suggestions, and feedback. I used React and TypeScript for the frontend, Express for the backend API layer, Firebase Authentication and Firestore for user/session management, and Gemini AI for question generation and evaluation.

## Interview Answer About This Project

If an interviewer asks, "Tell me about one of your projects," you can use this answer:

> One of my key projects is an AI Interview Practice Platform. I built it to simulate a mock interview experience for users who want to improve their interview skills. The application allows users to sign in, choose a role such as Java Developer or Frontend Developer, select the type of interview, and set the difficulty level. Based on those inputs, the backend calls Gemini AI to generate interview questions. After the user answers each question, the app evaluates the response and shows a score, strengths, areas for improvement, and detailed feedback.
>
> From a technical perspective, I used React, TypeScript, and Tailwind CSS for the frontend, Express and Node.js for the backend layer, and Firebase Authentication plus Firestore for user data and interview session storage. I also added progress tracking and interview history so users can review earlier sessions and measure improvement over time.
>
> One important challenge in this project was handling AI API limits and making the app more reliable for demos. I improved the error handling, moved Gemini access behind backend routes, and designed the system so the app could give users a cleaner experience even when external API issues happen.

## What I Learned

- How to integrate AI into a real full-stack application
- How to protect API keys by moving AI calls to backend routes
- How to use Firebase Authentication and Firestore in a practical project
- How to design user flows for interview practice, feedback, and progress tracking
- How to improve reliability when working with third-party API limits

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
