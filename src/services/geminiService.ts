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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
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
