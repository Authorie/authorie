import { createTRPCRouter } from "@server/api/trpc";
import getAllNotification from "./getAllNotification";

export const notificationRouter = createTRPCRouter({
  getAllNotification: getAllNotification,
});
