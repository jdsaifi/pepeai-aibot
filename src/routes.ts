import { Router } from 'express';
import config from './config';
import { telegramWebhookHandler } from './handler';
import { telegramLoginHandler } from './handler/auth';
import { authorizeUserRequest } from './middleware/auth';
import {
    addGroupKB,
    addGroupsQuestions,
    deleteGroupKB,
    groupDetails,
    groupsList,
    removeGroupQuestion,
    updateGroupKB,
    updateGroupsBasicDetails,
    updateGroupsQuestion,
} from './handler/group';

const router = Router();

router.post(config.telegramWebhookUrl, telegramWebhookHandler);

router.post('/auth/login', telegramLoginHandler);

// groups list
router.get('/groups', authorizeUserRequest, groupsList);

// group details
router.get('/groups/:id', authorizeUserRequest, groupDetails);

// update group's basic details
router.put('/groups/:id/basic', authorizeUserRequest, updateGroupsBasicDetails);

/**
 * Question route
 */

// add group's questions
router.post(
    '/groups/:id/questions/:questionType',
    authorizeUserRequest,
    addGroupsQuestions
);
// remove group's questions
router.delete(
    '/groups/:id/questions/:questionId/:questionType',
    authorizeUserRequest,
    removeGroupQuestion
);
// update question
router.put(
    '/groups/:id/questions/:questionId/:questionType',
    authorizeUserRequest,
    updateGroupsQuestion
);

/**
 * KB route
 */
// add kb
router.post('/groups/:id/kbs', authorizeUserRequest, addGroupKB);

// update kb
router.put('/groups/:id/kbs/:kbid', authorizeUserRequest, updateGroupKB);

// delete kb
router.delete('/groups/:id/kbs/:kbid', authorizeUserRequest, deleteGroupKB);

export default router;
