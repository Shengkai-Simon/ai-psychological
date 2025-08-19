import { useState, useEffect } from "react";

// Define the shape of the survey session data we'll store.
export interface SurveySessionState {
  surveySessionId: string | null;
  participantId: string | null;
  joinCode: string | null;
  role: "Parent" | "Child" | null;
}

const STORAGE_KEY = "surveySession";

/**
 * A custom hook to manage the survey session state in localStorage.
 * It provides a reactive way to access and update session data.
 */
export function useSurveySession() {
  const [session, setSession] = useState<SurveySessionState>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : { surveySessionId: null, participantId: null, joinCode: null, role: null };
    } catch (error) {
      console.error("Failed to parse survey session from localStorage", error);
      return { surveySessionId: null, participantId: null, joinCode: null, role: null };
    }
  });

  // Use useEffect to update localStorage whenever the session state changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("Failed to save survey session to localStorage", error);
    }
  }, [session]);

  // Function to clear the session, e.g., on logout or completion.
  const clearSession = () => {
    setSession({ surveySessionId: null, participantId: null, joinCode: null, role: null });
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return {
    session,
    setSession,
    clearSession,
    isSessionActive: !!session.surveySessionId && !!session.participantId,
  };
}
