export interface Question {
  id: number;
  text: string;
}

export interface Evaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

function formatGeminiError(errorText: string) {
  const normalized = errorText.toLowerCase();

  if (
    normalized.includes("resource_exhausted") ||
    normalized.includes("quota exceeded") ||
    normalized.includes("you exceeded your current quota") ||
    normalized.includes("\"code\":429")
  ) {
    return "AI usage limit reached right now. Please wait a bit and try again.";
  }

  if (normalized.includes("missing gemini api key")) {
    return "AI service is not configured correctly right now.";
  }

  return errorText || "Request failed";
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(formatGeminiError(errorText));
  }

  return response.json() as Promise<T>;
}

export async function generateQuestions(
  role: string,
  type: string,
  difficulty: string
): Promise<Question[]> {
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role, type, difficulty }),
  });

  return handleResponse<Question[]>(response);
}

export async function evaluateAnswer(
  question: string,
  answer: string
): Promise<Evaluation> {
  const response = await fetch("/api/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, answer }),
  });

  return handleResponse<Evaluation>(response);
}
