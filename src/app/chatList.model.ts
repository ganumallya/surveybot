import { ChatTranscript } from './chatTranscript.model';

export interface ChatList {
    _id: string;
    ldap: string;
    conversationStatus: number;
    conversations: [ChatTranscript];
    surveyName: string;
    surveyId: string;
    currentQuestionId: number;
    createdAt: number;
    updatedAt: number;
    timeLeft: number;
}
