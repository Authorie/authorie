import { createTRPCRouter } from "~/server/api/trpc";
import createChapter from "./createChapter";
import deleteDraftChapter from "./deleteDraft";
import getAllChapterIds from "./getAllChapterIds";
import getAllChapters from "./getAllChapters";
import getChapter from "./getChapter";
import getDraftChapters from "./getDrafts";
import getFeeds from "./getFeeds";
import getLeaderboard from "./getLeaderboard";
import isLike from "./isLike";
import like from "./like";
import readChapter from "./readChapter";
import unlike from "./unlike";
import buyChapter from "./buyChapter";

export const chapterRouter = createTRPCRouter({
  getAllChapters: getAllChapters,
  getAllIds: getAllChapterIds,
  getFeeds: getFeeds,
  getData: getChapter,
  getDrafts: getDraftChapters,
  getLeaderboard: getLeaderboard,
  create: createChapter,
  deleteDraft: deleteDraftChapter,
  read: readChapter,
  isLike: isLike,
  like: like,
  unlike: unlike,
  buyChapter: buyChapter,
});
