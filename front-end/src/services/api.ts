// src/services/api.ts

import type {
  AnswerInput,
  ParticipantInput,
  JoinSurveyInput,
} from "@/types/survey";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * A utility function to handle API responses.
 * @param response - The fetch response object.
 * @returns The JSON data from the response.
 * @throws An error if the response is not successful.
 */
async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "An unknown error occurred.");
  }
  return data.data;
}

/**
 * Initiates a new survey session.
 * @param participant - The details of the first participant.
 * @returns The session details, including join code and participant ID.
 */
export const initiateSurvey = async (participant: ParticipantInput) => {
  const response = await fetch(`${API_BASE_URL}/survey-sessions/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(participant),
  });
  return handleResponse(response);
};

/**
 * Allows a second participant to join an existing survey session.
 * @param joinData - The join code and participant's details.
 * @returns The session and new participant details.
 */
export const joinSurvey = async (joinData: JoinSurveyInput) => {
  const response = await fetch(`${API_BASE_URL}/survey-sessions/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(joinData),
  });
  return handleResponse(response);
};

/**
 * Submits the answers for a participant.
 * @param sessionId - The ID of the survey session.
 * @param participantId - The ID of the participant.
 * @param answers - An array of the participant's answers.
 */
export const submitAnswers = async (
  sessionId: string,
  participantId: string,
  answers: AnswerInput[]
) => {
  const response = await fetch(
    `${API_BASE_URL}/survey-sessions/${sessionId}/participants/${participantId}/answers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    }
  );

  // This endpoint returns a 204 No Content, so we don't expect a JSON body.
  // We'll just check if the status is OK.
  if (!response.ok) {
    throw new Error("Failed to submit answers.");
  }
};

/**
 * Fetches the analysis report for a given survey session.
 * @param sessionId - The ID of the survey session.
 * @returns An object containing the report status and the report content if completed.
 */
export const getReport = async (sessionId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/survey-sessions/${sessionId}/report`
  );
  return handleResponse(response);
};
