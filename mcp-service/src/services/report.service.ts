import prisma from '../config/prisma';
import { Report, SurveySessionStatus, Participant, Answer, Role } from '@prisma/client';
import { getAiAnalysis } from './gemini.service';

/**
 * Fetches the report for a given survey session.
 * This also checks the session's status to inform the client if the report is still being processed.
 *
 * @param sessionId - The ID of the survey session.
 * @returns An object containing the session status and the report (if available).
 */
export const getReportBySessionId = async (
    sessionId: string
): Promise<{ status: SurveySessionStatus; report: Report | null }> => {
    const session = await prisma.surveySession.findUnique({
        where: { id: sessionId },
        include: {
            report: true,
        },
    });

    if (!session) {
        throw new Error('Survey session not found.');
    }

    return {
        status: session.status,
        report: session.report,
    };
};

// --- Prompt Engineering ---
const createAnalysisPrompt = (parent: Participant & { answers: Answer[] }, child: Participant & { answers: Answer[] }): string => {
    const formatAnswers = (participant: Participant & { answers: Answer[] }) => {
        return participant.answers.map(a => `- ${a.questionId}: ${a.answer}`).join('\n');
    };

    const parentAnswers = formatAnswers(parent);
    const childAnswers = formatAnswers(child);

    return `
# ROLE & MISSION
You are an expert child psychologist. Your mission is to perform a multi-perspective analysis based on survey answers from a parent and their child. You must identify consistencies, discrepancies, and underlying psychological traits to generate a comprehensive, structured report in JSON format.

# INPUT DATA
Here is the data collected from the survey:

## Child's Profile
- Age: ${child.age}
- Gender: ${child.gender}

### Child's Answers
${childAnswers}

---

## Parent's Profile
- Age: ${parent.age}
- Gender: ${parent.gender}

### Parent's Answers (about the child)
${parentAnswers}

# ANALYSIS & OUTPUT REQUIREMENTS
Based on the data, you MUST perform the following analysis and structure your entire response as a single, valid JSON object.

1.  **Multi-perspective Analysis**: Compare the parent's and child's answers. Highlight key differences and similarities. What do these discrepancies or agreements imply?
2.  **Depth & Breadth Evaluation**: Assess the child's psychological state based on the combined answers. Evaluate traits related to anxiety, depression, social skills, and self-esteem.
3.  **Parenting Guidance**: Provide personalized, actionable parenting advice based on the analysis. The advice should be constructive and aimed at helping the parent understand and support their child better.
4.  **Visualized Data Suggestions**: Propose data points that could be visualized, such as a radar chart of key psychological traits (e.g., { "anxiety": 7, "social_skills": 4, "self_esteem": 5 }).

# FINAL JSON OUTPUT STRUCTURE (MANDATORY)
Your final output MUST be a single JSON object with the following structure. Do not include any text or formatting outside of this JSON structure.

\`\`\`json
{
  "multiPerspectiveAnalysis": {
    "summary": "A brief summary of the comparison between parent and child answers.",
    "keyDifferences": [
      {
        "topic": "Social Anxiety",
        "childsPerspective": "The child reports feeling very anxious in social situations.",
        "parentsPerspective": "The parent seems unaware of the extent of the child's social anxiety.",
        "implication": "This discrepancy suggests a communication gap or that the child is internalizing their struggles."
      }
    ]
  },
  "depthAndBreadthEvaluation": {
    "summary": "Overall psychological assessment of the child.",
    "traits": [
      { "trait": "Anxiety", "level": "High", "evidence": "Child's answers to Q3 and Q5 indicate significant worry and fear." },
      { "trait": "Self-Esteem", "level": "Moderate", "evidence": "Mixed responses regarding self-worth, with some positive indicators." }
    ]
  },
  "parentingGuidance": [
    {
      "area": "Communication",
      "advice": "Create a dedicated, distraction-free time to talk with your child daily. Use open-ended questions to encourage them to share more about their feelings."
    },
    {
      "area": "Building Confidence",
      "advice": "Acknowledge and praise your child's efforts, not just their achievements. Encourage them to pursue hobbies where they can experience mastery and success."
    }
  ],
  "visualizedData": {
    "radarChart": {
      "Anxiety": 8,
      "Depression": 5,
      "SocialSkills": 4,
      "SelfEsteem": 6,
      "Resilience": 7
    }
  }
}
\`\`\`
`;
};


/**
 * Generates a comprehensive psychological report based on the collected survey data.
 * This function is triggered automatically when all participants have completed the survey.
 *
 * NOTE: This is the placeholder for the core AI logic.
 *
 * @param sessionId - The ID of the survey session to generate a report for.
 */
export const generateReport = async (sessionId: string): Promise<void> => {
    console.log(`[ReportService] Starting report generation for session: ${sessionId}`);
    const MAX_RETRIES = 3;

    try {
        await prisma.surveySession.update({
            where: { id: sessionId },
            data: { status: 'PROCESSING' },
        });

        const session = await prisma.surveySession.findUnique({
            where: { id: sessionId },
            include: {
                participants: {
                    include: {
                        answers: true,
                    },
                },
            },
        });

        if (!session || session.participants.length < 2) {
            throw new Error('Session is not ready for report generation.');
        }

        const parent = session.participants.find(p => p.role === 'Parent');
        const child = session.participants.find(p => p.role === 'Child');

        if (!parent || !child) {
            throw new Error('Session must have one Parent and one Child.');
        }

        let prompt = createAnalysisPrompt(parent, child);
        let lastError: any = null;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`[ReportService] AI analysis attempt ${attempt}/${MAX_RETRIES} for session ${sessionId}`);

                // --- DETAILED LOGGING FOR DEMONSTRATION ---
                console.log("\n\n" + "=".repeat(80));
                console.log("==========     SENDING PROMPT TO GEMINI AI     ==========");
                console.log("=".repeat(80));
                console.log(prompt);
                console.log("=".repeat(80));
                console.log("==========           END OF PROMPT           ==========");
                console.log("=".repeat(80) + "\n\n");
                // --- END OF DETAILED LOGGING ---

                const aiResponseJson = await getAiAnalysis(prompt);

                await prisma.report.create({
                    data: {
                        surveySessionId: sessionId,
                        content: aiResponseJson,
                    },
                });

                await prisma.surveySession.update({
                    where: { id: sessionId },
                    data: { status: 'COMPLETED' },
                });

                console.log(`[ReportService] Successfully generated and saved report for session: ${sessionId}`);
                return; // Success, exit the function
            } catch (error) {
                lastError = error;
                console.warn(`[ReportService] Attempt ${attempt} failed for session ${sessionId}:`, error);
                if (attempt < MAX_RETRIES) {
                    // Create a corrective prompt for the next attempt
                    prompt += `\n\n---\n\nATTENTION: Your previous response failed with the error: "${(error as Error).message}". You MUST ensure your entire output is a single, valid, complete JSON object that adheres strictly to the required schema. Please try again.`;
                }
            }
        }

        // If all retries failed
        throw new Error(`AI analysis failed after ${MAX_RETRIES} attempts. Last error: ${lastError.message}`);

    } catch (error) {
        console.error(`[ReportService] Failed to generate report for session ${sessionId}:`, error);
        await prisma.surveySession.update({
            where: { id: sessionId },
            data: { status: 'FAILED' },
        });
    }
};
