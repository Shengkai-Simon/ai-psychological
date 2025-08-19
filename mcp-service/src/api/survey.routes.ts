import { Router } from 'express';
import { handleInitiateSurveySession, handleJoinSurveySession, handleSubmitAnswers, handleGetReport } from './survey.controller';

const router = Router();

// Route for initiating a new survey session.
router.post('/survey-sessions/initiate', handleInitiateSurveySession);

// Route for a second participant to join a session.
router.post('/survey-sessions/join', handleJoinSurveySession);

// Route for a participant to submit their answers.
router.post('/survey-sessions/:sessionId/participants/:participantId/answers', handleSubmitAnswers);

// Route to get the final analysis report.
router.get('/survey-sessions/:sessionId/report', handleGetReport);

export default router;
