import { consoleLog, deepLog } from '../utils/consoleLog';
import { GroupModel } from '../model/group';
import { CreateGroupInput, IGroup, IKB, IQuestions } from '../types';
import { getAIMessageSuccessRate, toMongoId } from '../utils/helper';
import mongoose from 'mongoose';

export default class GroupService {
    private static instance: GroupService;

    private constructor() {}

    public static getInstance(): GroupService {
        if (!GroupService.instance) {
            GroupService.instance = new GroupService();
        }
        return GroupService.instance;
    }

    public async groups(userId: number) {
        // Logic to get a group by ID
        const groups = await GroupModel.find({
            $or: [{ addedBy: userId }, { admins: userId }],
        }).select(
            'groupId groupName groupType addedBy admins createdAt updatedAt messageCount userCount'
        );
        return groups;
    }

    public async getGroupById(
        userId: number,
        groupId: string | number
    ): Promise<{ group: IGroup; aiMessageSuccessRate: number } | null> {
        // Logic to get a group by ID
        const condition = {
            $and: [
                { _id: groupId.toString() },
                {
                    $or: [{ addedBy: userId }, { admins: userId }],
                },
            ],
        };

        // deepLog(condition);
        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            return null;
        }
        const aiMessageSuccessRate = await getAIMessageSuccessRate(
            group.groupId
        );

        return { group, aiMessageSuccessRate };
    }

    public async createGroup(input: CreateGroupInput): Promise<void> {
        // Logic to create a group
        const group = await GroupModel.findOne({
            groupId: input.groupId,
        });

        if (!group) {
            const newGroup = new GroupModel(input);
            await newGroup.save();
            consoleLog.log('Group created with ID:', input.groupId);
        } else {
            consoleLog.log('Group already exists with ID:', input.groupId);
        }
    }

    public async deleteGroup(groupId: string): Promise<void> {
        // Logic to delete a group
        console.log(`Group with ID ${groupId} deleted.`);
    }

    public async updateGroupBasicDetails(
        groupId: string,
        userId: string,
        input: Partial<IGroup>
    ) {
        const condition = {
            $and: [
                { _id: groupId.toString() },
                {
                    $or: [{ addedBy: userId }, { admins: userId }],
                },
            ],
        };

        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            throw new Error('Group not found');
        }

        const groupInfo = await GroupModel.findOneAndUpdate(condition, input, {
            new: true,
        });

        return groupInfo;
    }

    public async addQuestion(
        groupId: string,
        userId: string,
        questionType: 'positiveQuestions' | 'negativeQuestions',
        input: IQuestions
    ) {
        const condition = {
            $and: [
                { _id: groupId.toString() },
                {
                    $or: [{ addedBy: userId }, { admins: userId }],
                },
            ],
        };

        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            throw new Error('Group not found');
        }

        const groupInfo = await GroupModel.findOneAndUpdate(
            condition,
            {
                $push: {
                    [questionType]: input,
                },
            },
            {
                new: true,
            }
        );

        return groupInfo;
    }

    public async removeQuestion(
        groupId: string,
        userId: string,
        questionType: 'positiveQuestions' | 'negativeQuestions',
        questionId: string
    ) {
        const condition = {
            $and: [
                { _id: groupId.toString() },
                {
                    $or: [{ addedBy: userId }, { admins: userId }],
                },
            ],
        };

        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            throw new Error('Group not found');
        }

        const groupInfo = await GroupModel.findOneAndUpdate(
            condition,
            {
                $pull: {
                    [questionType]: {
                        _id: questionId,
                    },
                },
            },
            {
                new: true,
            }
        );

        return groupInfo;
    }

    public async updateQuestion(
        groupId: string,
        userId: string,
        questionType: 'positiveQuestions' | 'negativeQuestions',
        questionId: string,
        input: IQuestions
    ) {
        const condition = {
            $and: [
                { _id: groupId.toString() },
                {
                    $or: [{ addedBy: userId }, { admins: userId }],
                },
            ],
        };

        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            throw new Error('Group not found');
        }

        const question = (
            group[questionType] as mongoose.Types.DocumentArray<IQuestions>
        )?.id(questionId);

        if (!question) {
            throw new Error('Question not found');
        }

        const groupInfo = await GroupModel.findOneAndUpdate(
            {
                _id: toMongoId(groupId || ''),
                [`${questionType}._id`]: toMongoId(questionId),
            },
            {
                $set: {
                    [`${questionType}.$.question`]: input.question,
                    [`${questionType}.$.answer`]: input.answer,
                    [`${questionType}.$.category`]: input.category,
                },
            },
            {
                new: true,
            }
        );

        return groupInfo;
    }

    public async addKB(groupId: string, userId: string, input: IKB) {
        const condition = {
            $and: [
                { _id: toMongoId(groupId) },
                {
                    $or: [{ addedBy: userId }, { admins: userId }],
                },
            ],
        };

        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            throw new Error('Group not found');
        }

        const groupInfo = await GroupModel.findOneAndUpdate(
            condition,
            {
                $push: {
                    kb: input,
                },
            },
            {
                new: true,
            }
        );

        return groupInfo;
    }

    public async updateKB(
        groupId: string,
        userId: string,
        kbId: string,
        input: IKB
    ) {
        const condition = {
            $and: [
                { _id: groupId.toString() },
                {
                    $or: [{ addedBy: userId }, { admins: userId }],
                },
            ],
        };

        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            throw new Error('Group not found');
        }

        const kb = (group.kb as mongoose.Types.DocumentArray<IKB>)?.id(kbId);

        if (!kb) {
            throw new Error('Knowledge not found');
        }

        const groupInfo = await GroupModel.findOneAndUpdate(
            {
                _id: toMongoId(groupId || ''),
                [`kb._id`]: toMongoId(kbId),
            },
            {
                $set: {
                    [`kb.$.title`]: input.title,
                    [`kb.$.content`]: input.content,
                    [`kb.$.category`]: input.category,
                },
            },
            {
                new: true,
            }
        );

        return groupInfo;
    }

    public async deleteKB(groupId: string, userId: string, kbId: string) {
        const condition = {
            $and: [
                { _id: groupId.toString() },
                {
                    $or: [{ addedBy: userId }, { admins: userId }],
                },
            ],
        };

        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            throw new Error('Group not found');
        }

        const kb = (group.kb as mongoose.Types.DocumentArray<IKB>)?.id(kbId);

        if (!kb) {
            throw new Error('Knowledge not found');
        }

        const groupInfo = await GroupModel.findOneAndUpdate(
            {
                _id: toMongoId(groupId || ''),
                [`kb._id`]: toMongoId(kbId),
            },
            {
                $pull: {
                    kb: {
                        _id: toMongoId(kbId),
                    },
                },
            },
            {
                new: true,
            }
        );

        return groupInfo;
    }

    public async incrementMessageCount(groupId: string) {
        const group = await GroupModel.findOne({ groupId: groupId });
        if (group) {
            group.messageCount += 1;
            await group.save();
            consoleLog.log(`Updated message count for group ${groupId}`);
        } else {
            consoleLog.log(`Group not found with ID: ${groupId}`);
        }
    }

    public async updateGroupMemberCount(groupId: string, count: number) {
        const group = await GroupModel.findOne({ groupId: groupId });
        if (group) {
            group.userCount = count;
            await group.save();
            consoleLog.log(
                `Updated group member count for group ${groupId} to ${count}`
            );
        } else {
            consoleLog.log(`Group not found with ID: ${groupId}`);
        }
    }

    public async getGroupByTgId(
        groupId: string | number
    ): Promise<IGroup | null> {
        // Logic to get a group by ID

        const condition = {
            groupId: groupId?.toString(),
        };
        // deepLog(condition);
        const group = await GroupModel.findOne(condition);
        if (!group) {
            consoleLog.log('Group not found with ID:', groupId);
            return null;
        }
        return group;
    }
}
