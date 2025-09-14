import { consoleLog } from '../utils/consoleLog';
import GroupService from '../services/groupService';
import { z } from 'zod';
import { Request, Response } from 'express';
import { IKB, IQuestions } from '@/types';

const updateGroupsBasicDetailsSchema = z.object({
    agentName: z.string().optional(),
    groupDescription: z.string().optional(),
    groupBotToken: z.string().regex(/^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/, {
        message: 'Invalid bot token format',
    }),
    groupBotUsername: z
        .string()
        .min(1, 'Bot username is required')
        .max(32, 'Bot username must be less than 32 characters')
        .regex(/^@/, {
            message: 'Bot username must start with @',
        }),
    AIPersona: z
        .string()
        .min(10, 'AI Persona must be at least 10 characters')
        .max(1000, 'AI Persona must be less than 1000 characters'),
    agentTriggerKeywords: z
        .array(z.string().min(1, 'Trigger word cannot be empty'))
        .min(1, 'At least one trigger word is required'),
});

const addGroupQuestionsSchema = z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string(),
});

const groupKBSchema = z.object({
    title: z.string(),
    content: z.string(),
    category: z.string(),
});

// get users group list
export const groupsList = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;

        consoleLog.info("Fetching user's groups..., ", user);
        const groupService = GroupService.getInstance();
        const result = await groupService.groups(user.userId);

        res.status(200).json({
            code: 200,
            message: 'groups list',
            result,
        });
    } catch (error: any) {
        console.error('Error fetching groups:', error);
        return res.status(500).json({
            code: 500,
            message: 'Error fetching group: ' + error?.message,
        });
    }
}; // END

// get group details
export const groupDetails = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;
        const groupId = req.params.id;

        consoleLog.info('Fetching groups details..., ');
        const groupService = GroupService.getInstance();
        const result = await groupService.getGroupById(user.userId, groupId);

        res.status(200).json({
            code: 200,
            message: 'Group details',
            result: {
                ...result?.group?.toObject(),
                aiMessageSuccessRate: result?.aiMessageSuccessRate || 0,
            },
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
}; // END

// update group's basic details
export const updateGroupsBasicDetails = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;
        const groupId = req.params?.id;
        const body = req.body;
        consoleLog.info('updating groups basic details with body: ', body);

        // validate body by zod
        const validatedBody = updateGroupsBasicDetailsSchema.parse(body);

        // consoleLog.log(
        //     '\n\n\n validated body: ',
        //     validatedBody,
        //     validatedBody.agentTriggerKeywords[0]
        // );

        const groupService = GroupService.getInstance();
        const result = await groupService.updateGroupBasicDetails(
            groupId,
            user.userId,
            validatedBody
        );

        res.status(201).json({
            code: 201,
            message: 'Group config has been saved',
            result,
        });
    } catch (error: any) {
        return res.status(400).json({
            code: 400,
            message: error?.message,
        });
    }
}; // END

// add group's questions
export const addGroupsQuestions = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;
        const { id: groupId, questionType } = req.params;
        const body = req.body;
        consoleLog.info('adding groups questions with body: ', body);

        if (!groupId || !questionType) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid request',
            });
        }

        // validate body by zod
        const validatedBody = addGroupQuestionsSchema.parse(body);

        consoleLog.log('\n\n\n validated body: ', groupId, validatedBody);

        const groupService = GroupService.getInstance();
        const result = await groupService.addQuestion(
            groupId,
            user.userId,
            questionType as 'positiveQuestions' | 'negativeQuestions',
            validatedBody as IQuestions
        );

        res.status(201).json({
            code: 201,
            message: 'Question has been added',
            result,
        });
    } catch (error: any) {
        return res.status(400).json({
            code: 400,
            message: error?.message,
        });
    }
}; // END

// remove question
export const removeGroupQuestion = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;
        const { id: groupId, questionType, questionId } = req.params;

        consoleLog.info('removing group question');

        if (!groupId || !questionType || !questionId) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid request',
            });
        }

        const groupService = GroupService.getInstance();
        const result = await groupService.removeQuestion(
            groupId,
            user.userId,
            questionType as 'positiveQuestions' | 'negativeQuestions',
            questionId
        );

        res.status(201).json({
            code: 201,
            message: 'Question has been removed',
            result,
        });
    } catch (error: any) {
        return res.status(400).json({
            code: 400,
            message: error?.message,
        });
    }
}; // END

// update group's question
export const updateGroupsQuestion = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;
        const { id: groupId, questionType, questionId } = req.params;
        const body = req.body;
        consoleLog.info('updating groups question with body: ', body);

        // validate body by zod
        const validatedBody = addGroupQuestionsSchema.parse(body);

        // consoleLog.log(
        //     '\n\n\n validated body: ',
        //     validatedBody,
        //     validatedBody.agentTriggerKeywords[0]
        // );

        const groupService = GroupService.getInstance();
        const result = await groupService.updateQuestion(
            groupId,
            user.userId,
            questionType as 'positiveQuestions' | 'negativeQuestions',
            questionId,
            validatedBody as IQuestions
        );

        res.status(201).json({
            code: 201,
            message: 'Group config has been saved',
            result,
        });
    } catch (error: any) {
        return res.status(400).json({
            code: 400,
            message: error?.message,
        });
    }
}; // END

// add kb
export const addGroupKB = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;
        const { id: groupId } = req.params;
        const body = req.body;
        consoleLog.info('adding group KB with body: ', body);

        if (!groupId) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid request',
            });
        }

        // validate body by zod
        const validatedBody = groupKBSchema.parse(body);

        consoleLog.log('\n\n\n validated body: ', groupId, validatedBody);

        const groupService = GroupService.getInstance();
        const result = await groupService.addKB(
            groupId,
            user.userId,
            validatedBody as IKB
        );

        res.status(201).json({
            code: 201,
            message: 'Group knowlege has been added',
            result,
        });
    } catch (error: any) {
        return res.status(400).json({
            code: 400,
            message: error?.message,
        });
    }
}; // END

// update kb
export const updateGroupKB = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;
        const { id: groupId, kbid } = req.params;
        const body = req.body;
        consoleLog.info('updating group KB with body: ', body);

        if (!groupId) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid request',
            });
        }

        // validate body by zod
        const validatedBody = groupKBSchema.parse(body);

        consoleLog.log('\n\n\n validated body: ', groupId, validatedBody);

        const groupService = GroupService.getInstance();
        const result = await groupService.updateKB(
            groupId,
            user.userId,
            kbid,
            validatedBody as IKB
        );

        res.status(201).json({
            code: 201,
            message: 'Group knowlege has been updated',
            result,
        });
    } catch (error: any) {
        return res.status(400).json({
            code: 400,
            message: error?.message,
        });
    }
}; // END

// delete kb
export const deleteGroupKB = async (req: Request, res: Response) => {
    try {
        const { user } = res.locals;
        const { id: groupId, kbid } = req.params;

        if (!groupId) {
            return res.status(400).json({
                code: 400,
                message: 'Invalid request',
            });
        }

        const groupService = GroupService.getInstance();
        const result = await groupService.deleteKB(groupId, user.userId, kbid);

        res.status(201).json({
            code: 201,
            message: 'Group knowlege has been removed',
            result,
        });
    } catch (error: any) {
        return res.status(400).json({
            code: 400,
            message: error?.message,
        });
    }
}; // END
