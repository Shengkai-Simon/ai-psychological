import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/response.util';
import { initiateSurveySession, joinSurveySession, submitAnswers } from '../services/survey.service';
import { getReportBySessionId } from '../services/report.service';
import { z } from 'zod';

// Define a Zod schema for input validation to ensure type safety and data integrity.
const InitiateSurveySchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    age: z.number().int().positive('Age must be a positive integer.'),
    gender: z.string().min(1, 'Gender is required.'),
    role: z.enum(['Parent', 'Child']),
});

// Define a new Zod schema for the "join" action.
// It includes the joinCode and the participant's details.
const JoinSurveySchema = z.object({
    joinCode: z.string().length(6, 'Join code must be 6 characters.'),
    name: z.string().min(1, 'Name is required.'),
    age: z.number().int().positive('Age must be a positive integer.'),
    gender: z.string().min(1, 'Gender is required.'),
    role: z.enum(['Parent', 'Child']),
});

// Define a Zod schema for a single answer.
const AnswerSchema = z.object({
    questionId: z.string().min(1),
    answer: z.string().min(1),
});

// Define the Zod schema for the entire "submit answers" request body.
const SubmitAnswersSchema = z.object({
    answers: z.array(AnswerSchema),
});

/**
 * Handles the request to initiate a new survey session.
 * It validates the request body and calls the survey service.
 * POST /survey-sessions/initiate
 */
export const handleInitiateSurveySession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // 1. Validate the request body against the schema
        const participantInput = InitiateSurveySchema.parse(req.body);

        // 2. Call the service function with validated data
        const { session, participant, joinCode } = await initiateSurveySession(participantInput);

        // 3. Send a successful response
        ResponseHandler.success(res, {
            surveySessionId: session.id,
            participantId: participant.id,
            joinCode: joinCode,
        }, 'Survey session initiated successfully.');

    } catch (error) {
        // If there's a Zod validation error, it will be caught here
        // and passed to the global error handler.
        next(error);
    }
};

/**
 * Handles the request for a participant to join an existing survey session.
 * It validates the request body, including the join code.
 * POST /survey-sessions/join
 */
export const handleJoinSurveySession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // 1. Validate the request body
        const { joinCode, ...participantInput } = JoinSurveySchema.parse(req.body);

        // 2. Call the service function
        const { session, participant } = await joinSurveySession(joinCode, participantInput);

        // 3. Send a successful response
        ResponseHandler.success(res, {
            surveySessionId: session.id,
            participantId: participant.id,
        }, 'Successfully joined the survey session.');

    } catch (error) {
        next(error);
    }
};

/**
 * Handles the request to submit answers for a participant.
 * POST /survey-sessions/:sessionId/participants/:participantId/answers
 */
export const handleSubmitAnswers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // 1. Extract IDs from the URL parameters
        const { sessionId, participantId } = req.params;

        // 2. Validate the request body
        const { answers } = SubmitAnswersSchema.parse(req.body);

        // 3. Call the service function
        await submitAnswers(sessionId, participantId, answers);

        // 4. Send a successful, but empty (204) response.
        // The client knows the submission was successful and can navigate away.
        res.status(204).send();

    } catch (error) {
        next(error);
    }
};

/**
 * Handles the request to get the analysis report for a survey session.
 * GET /survey-sessions/:sessionId/report
 */
export const handleGetReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;

        const { status, report } = await getReportBySessionId(sessionId);

        // Based on the status, we return different responses.
        if (status === 'COMPLETED' && report) {
            ResponseHandler.success(res, {
                status: status,
                report: report.content, // Return only the JSON content of the report
            }, 'Report successfully retrieved.');
        } else {
            // For PENDING, PROCESSING, or FAILED statuses
            ResponseHandler.success(res, {
                status: status,
                report: null,
            }, `Report status: ${status}`);
        }

    } catch (error) {
        next(error);
    }
};
