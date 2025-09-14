import { IGroup } from '../types';
import config from '../config';
import OpenAI from 'openai';
import { consoleLog } from '../utils/consoleLog';

const buildPrompt = (question: string, group: IGroup): string => {
    let kb = '';
    if (Array.isArray(group.kb)) {
        kb = group.kb
            .map((kbItem) => `${kbItem.title} - ${kbItem.content}`)
            .join('\n');
    }

    let positiveQuestions = '';
    if (Array.isArray(group.positiveQuestions)) {
        positiveQuestions = group.positiveQuestions
            .map(
                (q) =>
                    `Question with Category: ${q.question}(${q.category}) - Answer: ${q.answer}`
            )
            .join('\n');
    }

    let negativeQuestions = '';
    if (Array.isArray(group.negativeQuestions)) {
        negativeQuestions = group.negativeQuestions
            .map(
                (q) =>
                    `Question with Category: ${q.question}(${q.category}) - Answer: ${q.answer}`
            )
            .join('\n');
    }

    let prompt =
        'You are a helpful AI assistent and can answer to any question related to the project. You will be provided with knowledge base about the project. Please give consice and clear answer in 3-5 sentences only. Do not include any personal information or opinions about the project. Use the knowledge base provided to answer the question.';

    if (group.AIPersona) {
        prompt += ` Your persona style would be: ${group.AIPersona}.`;
    } else {
        prompt += ` Your persona style would be: expert person, reponse like a fun and nice human.`;
    }

    prompt += ` Knowledge base: \n${kb}.`;
    prompt += ` Positive questions if asked just send exact Answer (Without explaination): \n${positiveQuestions}.`;
    prompt += ` Negative questions if asked just send exact Answer (Without explaination): \n${negativeQuestions}.`;
    prompt += ` Question from user: \n${question}.`;

    prompt += `Format the feedback as a JSON object with the following structure:
        {
            "airesponse": string
        }`;

    prompt += `Ensure that:
        1. The answer is relevant to the knowledge base provded.
        2. The answer is concise and to the point.
        3. The answer is helpful for the user.
        4. The response is valid JSON format`;

    return prompt;
};

const getAiResponse = async (
    question: string,
    group: IGroup
): Promise<string> => {
    const prompt = buildPrompt(question, group);

    try {
        const openai = new OpenAI({
            baseURL: config.openRouter.url,
            apiKey: config.openRouter.key,
        });

        const response: any = await openai.chat.completions.create({
            model: 'google/gemini-flash-1.5',
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
        });

        if ('error' in response) {
            throw new Error(response?.error?.message || 'Unknown error');
        }

        consoleLog.log(
            'response.choices[0].message.content: ',
            response.choices[0].message.content
        );

        const jsonResponse = JSON.parse(response.choices[0].message.content);

        return jsonResponse['airesponse'];
    } catch (error) {
        console.error('Error generating ai response:', error);
        throw new Error('Failed to generate ai response');
    }
};

export default getAiResponse; // Assuming you want
