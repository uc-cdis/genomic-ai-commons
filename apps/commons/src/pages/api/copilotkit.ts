import { createChatHandler } from '@gen3/chat/server';
import { authenticateCopilotRequest } from '@/lib/copilot/auth';



export const config = { api: { bodyParser: true } };


export default createChatHandler({
  verifyToken: authenticateCopilotRequest,
  endpoint: '/copilot-runtime',
});
