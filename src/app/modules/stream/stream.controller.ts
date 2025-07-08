import { StreamChat } from 'stream-chat';
import { Request, Response } from 'express';

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_SECRET!;
const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const getStreamToken = async (req: Request, res: Response) => {


  const { userId, name, image } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  await chatClient.upsertUser({
    id: userId,
    name,
    image,
  });

  const chatToken = chatClient.createToken(userId);


  return res.status(200).json({
    success: true,
    message: 'Token created',
    data: {
      chatToken,
      apiKey,
    },
  });
};
