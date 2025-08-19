import prisma from '../config/prisma';
import { Participant, SurveySession } from '@prisma/client';
import { generateJoinCode } from '../utils/joinCode.util';
import { generateReport } from './report.service';

// Define the input type for creating a participant, using an interface for clarity
interface ParticipantInput {
    name: string;
    age: number;
    gender: string;
    role: 'Parent' | 'Child';
}

// Define the input type for a single answer
interface AnswerInput {
    questionId: string;
    answer: string;
}

/**
 * Initiates a new survey session.
 * This is the entry point for the first user (either parent or child).
 *
 * @param participantInput - The details of the first participant.
 * @returns An object containing the new session, the first participant, and the join code.
 */
export const initiateSurveySession = async (
    participantInput: ParticipantInput
): Promise<{ session: SurveySession; participant: Participant; joinCode: string }> => {
    const joinCode = generateJoinCode();

    const session = await prisma.surveySession.create({
        data: {
            joinCode: joinCode,
            participants: {
                create: [
                    {
                        name: participantInput.name,
                        age: participantInput.age,
                        gender: participantInput.gender,
                        role: participantInput.role,
                    },
                ],
            },
        },
        include: {
            participants: true, // Include the newly created participant in the return value
        },
    });

    const participant = session.participants[0];

    return { session, participant, joinCode };
};

/**
 * Adds a second participant to an existing survey session using a join code.
 *
 * @param joinCode - The 6-digit code for the session.
 * @param participantInput - The details of the participant who is joining.
 * @returns An object containing the updated session and the new participant.
 * @throws Will throw an error if the join code is invalid or the session is already full.
 */
export const joinSurveySession = async (
    joinCode: string,
    participantInput: ParticipantInput
): Promise<{ session: SurveySession; participant: Participant }> => {
    // 1. Find the session by the unique join code
    const session = await prisma.surveySession.findUnique({
        where: { joinCode },
        include: { participants: true },
    });

    if (!session) {
        throw new Error('Invalid join code.');
    }

    // 2. Check if the session already has two participants
    if (session.participants.length >= 2) {
        throw new Error('This survey session is already full.');
    }

    // 3. Check for role conflict (e.g., two Parents trying to join)
    if (session.participants[0].role === participantInput.role) {
        throw new Error(`This session already has a ${participantInput.role}.`);
    }

    // 4. Create the new participant and link them to the session
    const updatedSession = await prisma.surveySession.update({
        where: { id: session.id },
        data: {
            participants: {
                create: {
                    name: participantInput.name,
                    age: participantInput.age,
                    gender: participantInput.gender,
                    role: participantInput.role,
                },
            },
        },
        include: {
            participants: true,
        },
    });

    // The new participant will be the second one in the array
    const newParticipant = updatedSession.participants[1];

    return { session: updatedSession, participant: newParticipant };
};

/**
 * Saves the answers for a specific participant and marks them as completed.
 * If all participants in the session are complete, it triggers the AI report generation.
 *
 * @param sessionId - The ID of the survey session.
 * @param participantId - The ID of the participant submitting answers.
 * @param answers - An array of the participant's answers.
 */
export const submitAnswers = async (
    sessionId: string,
    participantId: string,
    answers: AnswerInput[]
): Promise<void> => {
    // Use a transaction to ensure all database operations succeed or fail together.
    await prisma.$transaction(async (tx) => {
        // 1. Create all the answers for the participant.
        await tx.answer.createMany({
            data: answers.map((a) => ({
                ...a,
                participantId: participantId,
            })),
        });

        // 2. Mark the participant as completed.
        await tx.participant.update({
            where: { id: participantId },
            data: { isCompleted: true },
        });

        // 3. Check if all participants in the session are now complete.
        const session = await tx.surveySession.findUnique({
            where: { id: sessionId },
            include: { participants: true },
        });

        if (!session) {
            throw new Error('Survey session not found.');
        }

        const allCompleted = session.participants.every((p) => p.isCompleted);

        // 4. If everyone has completed the survey, trigger the report generation.
        if (allCompleted && session.participants.length > 0) {
            console.log(`[SurveyService] All participants in session ${sessionId} have completed the survey. Triggering report generation.`);
            // IMPORTANT: We call this without `await` to run it in the background.
            // The API can return a response to the user immediately, while the AI
            // processes the report asynchronously.
            generateReport(sessionId).catch(err => {
                console.error(`[SurveyService] Error during background report generation for session ${sessionId}:`, err);
                // Optionally, update the session status to FAILED here.
            });
        }
    });
};
