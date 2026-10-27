import { createDownloadHandler } from "@gen3/chat/server";
import { authenticateChatRequest } from "@/lib/chat/auth";

// streamed files can be large manifests; without this Next warns past 4MB
export const config = { api: { responseLimit: false } };

// reached through the /download/:kind/:handle rewrite in next.config.js
export default createDownloadHandler({ verifyToken: authenticateChatRequest });
