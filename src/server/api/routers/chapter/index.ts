import { createTRPCRouter } from "@server/api/trpc";
import createChapter from "./createChapter";
import deleteDraftChapter from "./deleteDraft";
import getAllChapters from "./getAllChapters";
import getChapter from "./getChapter";
import getDraftChapters from "./getDrafts";
import getLeaderboard from "./getLeaderboard";
import isLike from "./isLike";
import like from "./like";
import readChapter from "./readChapter";
import unlike from "./unlike";

export const chapterRouter = createTRPCRouter({
  getAll: getAllChapters,
  getData: getChapter,
  getDrafts: getDraftChapters,
  getLeaderboard: getLeaderboard,
  create: createChapter,
  deleteDraft: deleteDraftChapter,
  read: readChapter,
  isLike: isLike,
  like: like,
  unlike: unlike,
});
