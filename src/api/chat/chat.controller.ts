import type { Request, Response } from "express";
import express from "express";
import firebaseAdmin from "../../utils/firebase";
import { getUser } from "../member/member.model";
import { getFromS3 } from "../../helpers/s3";
import { errorHandler } from "../../helpers/utils";

export const chatRouter = express.Router();

const db = firebaseAdmin.database();

chatRouter.post("/send-message", async (req: Request, res: Response) => {
  const { recipientUid, message } = req.body;
  const uid = req.headers.idFromJWT.toString();
  const chatId = [uid, recipientUid].sort().join("_");

  if (!recipientUid) {
    return res.status(404).json({ message: "recipientUid required" });
  }

  if (!message) {
    return res.status(404).json({ message: "blank message not allowed" });
  }

  const sender = await getUser(uid);
  const recipient = await getUser(recipientUid);

  try {
    const newMessageRef = db.ref(`chats/${chatId}/messages`).push({
      senderUid: uid,
      recipientId: recipientUid,
      text: message,
      senderAvatar: sender?.profileAvatar
        ? await getFromS3(sender?.profileAvatar)
        : "none",
      receipientAvatar: recipient?.profileAvatar
        ? await getFromS3(recipient?.profileAvatar)
        : "none",
      senderName: `${sender?.firstName} ${sender?.lastName}`,
      receipientName: `${recipient?.firstName} ${recipient?.lastName}`,
      timestamp: firebaseAdmin.database.ServerValue.TIMESTAMP,
    });

    const newMessage = (await newMessageRef.once("value")).val();

    // Emit the new message to the recipient using a real-time mechanism (e.g., WebSocket or Firebase Cloud Messaging).
    // This step is crucial for real-time functionality.

    res.status(200).json({ success: true, message: "message sent!" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "message sending failed!",
    });
  }
});

chatRouter.get("/list", async (req: Request, res: Response) => {
  const { page, perPage } = req.query;

  const pageNumber = parseInt(page as string, 10) || 1;

  const uid = req.headers.idFromJWT.toString();
  const chatsRef = db.ref("chats");

  // Fetch all chats
  chatsRef
    .once("value")
    .then(async (snapshot) => {
      const chats = snapshot.val();

      if (!chats) {
        console.log("No chats found for the user.");
        return res.status(200).json({
          data: [],
          currentPage: 1,
          totalPages: 1,
          itemsPerPage: perPage,
          totalItems: 0,
        });
      }

      // Filter chat IDs where uid is a participant
      const userChatIds = Object.keys(chats).filter((chatId) =>
        chatId.includes(uid)
      );

      const userIdPaginated = userChatIds.slice(
        (Number(page) - 1) * Number(perPage),
        Number(page) * Number(perPage)
      );

      const chatList = await Promise.all(
        userIdPaginated.map(async (chatId) => {
          const receipientId = chatId
            .split("_")
            .find((chatid) => chatid !== uid);
          const userAvatar = (await getUser(receipientId))?.profileAvatar;

          return {
            data: { chatId, receipientId, avatar: userAvatar ?? "none" },
          };
        })
      );

      const totalItems = userChatIds.length;
      const totalPages = Math.ceil(totalItems / Number(perPage));

      res.status(200).json({
        data: chatList,
        currentPage: pageNumber,
        totalPages,
        itemsPerPage: Number(perPage),
        totalItems,
      });
    })
    .catch((error) => {
      return errorHandler({ error, res, req });
    });
});
