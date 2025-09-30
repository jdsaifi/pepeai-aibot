import { Logger } from '../utils/logger';
import { getRabbitMQChannel } from '../library/rabbitmq';
import config from '../config';
import GroupService from '../services/groupService';
import { ConsumeMessage } from 'amqplib';
import { consoleLog } from '@/utils/consoleLog';
import bot from '@/bot';

// const data = {
//     update_id: 578579984,
//     my_chat_member: {
//         chat: {
//             id: -1002925016269,
//             title: 'Pepeai agent group 1',
//             username: 'hfhjvbjkv',
//             type: 'supergroup',
//         },
//         from: {
//             id: 1365355482,
//             is_bot: false,
//             first_name: 'Jd',
//             last_name: 'Saifi',
//             username: 'jdsaifi',
//             language_code: 'en',
//         },
//         date: 1759206526,
//         old_chat_member: {
//             user: {
//                 id: 7584561322,
//                 is_bot: true,
//                 first_name: 'PepeAI Agent Hub',
//                 username: 'pepeai_agent_hub_bot',
//             },
//             status: 'member',
//         },
//         new_chat_member: {
//             user: {
//                 id: 7584561322,
//                 is_bot: true,
//                 first_name: 'PepeAI Agent Hub',
//                 username: 'pepeai_agent_hub_bot',
//             },
//             status: 'administrator',
//             can_be_edited: false,
//             can_manage_chat: true,
//             can_change_info: true,
//             can_delete_messages: true,
//             can_invite_users: true,
//             can_restrict_members: true,
//             can_pin_messages: true,
//             can_manage_topics: false,
//             can_promote_members: false,
//             can_manage_video_chats: true,
//             can_post_stories: true,
//             can_edit_stories: true,
//             can_delete_stories: true,
//             is_anonymous: false,
//             can_manage_voice_chats: true,
//         },
//     },
// };

const upsertGroup = async (message: ConsumeMessage) => {
    const update = JSON.parse(message.content.toString());
    if (!update.message || !update.message.chat || !update.my_chat_member) {
        Logger.error({
            event: 'Invalid message format in consumeGroupHandler',
            content: message.content.toString(),
        });
        return;
    }

    consoleLog.log('Update received in consumeGroupHandler:', update);
    const groupService = GroupService.getInstance();
    if ('my_chat_member' in update) {
        // handle bot being added to group
        const { new_chat_member } = update.my_chat_member;
        if (
            new_chat_member.status === 'administrator' &&
            new_chat_member?.user?.username === config.tgBotUsername
        ) {
            // bot was added to group
            Logger.info({
                event: 'Bot added to group',
                chat: update.my_chat_member.chat,
            });
            const { chat: group, from: user } = update.my_chat_member;
            const input = {
                groupId: group.id,
                groupName: group.title,
                groupType: group.type,
                addedBy: user ? user.id : null,
            };

            await groupService.createGroup(input);
        }
    } else {
        // const groupInfo = await groupService.getGroupByTelegramId(
        //     update.message.chat.id
        // );
        // if (!groupInfo) {
        //     const admins = await bot.telegram.getChatAdministrators(
        //         update.message.chat.id
        //     );
        //     const creator = admins.find((admin) => admin.status === 'creator');
        //     consoleLog.log('creator:', creator);
        //     const { chat: group } = update.message;
        //     const input = {
        //         groupId: group.id,
        //         groupName: group.title,
        //         groupType: group.type,
        //         addedBy: creator?.user ? creator?.user?.id : null,
        //     };
        //     await groupService.createGroup(input);
        // }
    }
};

// {
//   event: 'Telegram Webhook Received',
//   data: {
//     update_id: 578579983,
//     my_chat_member: {
//       chat: {
//         id: -1002925016269,
//         title: 'Pepeai agent group 1',
//         username: 'hfhjvbjkv',
//         type: 'supergroup'
//       },
//       from: {
//         id: 1365355482,
//         is_bot: false,
//         first_name: 'Jd',
//         last_name: 'Saifi',
//         username: 'jdsaifi',
//         language_code: 'en'
//       },
//       date: 1759206478,
//       old_chat_member: {
//         user: {
//           id: 7584561322,
//           is_bot: true,
//           first_name: 'PepeAI Agent Hub',
//           username: 'pepeai_agent_hub_bot'
//         },
//         status: 'administrator',
//         can_be_edited: false,
//         can_manage_chat: true,
//         can_change_info: false,
//         can_delete_messages: true,
//         can_invite_users: true,
//         can_restrict_members: true,
//         can_pin_messages: true,
//         can_manage_topics: false,
//         can_promote_members: false,
//         can_manage_video_chats: false,
//         can_post_stories: false,
//         can_edit_stories: false,
//         can_delete_stories: false,
//         is_anonymous: false,
//         can_manage_voice_chats: false
//       },
//       new_chat_member: {
//         user: {
//           id: 7584561322,
//           is_bot: true,
//           first_name: 'PepeAI Agent Hub',
//           username: 'pepeai_agent_hub_bot'
//         },
//         status: 'member'
//       }
//     }
//   }
// }

async function consumeGroupHandler() {
    const channel = await getRabbitMQChannel();

    const q = await channel.assertQueue('', { exclusive: true });
    Logger.info({
        event: 'Waiting for messages in consumeGroupHandler',
        queue: q.queue,
    });
    await channel.bindQueue(
        q.queue,
        config.rabbitmq.telegramUpdateExchange,
        ''
    );
    channel.consume(
        q.queue,
        (msg) => {
            if (msg !== null) {
                Logger.info({
                    event: 'Received message at (consumeGroupHandler)',
                    content: msg.content.toString(),
                });

                upsertGroup(msg);
                Logger.info('\n');
                channel.ack(msg);
            }
        },
        { noAck: false }
    );
}

export default consumeGroupHandler;
