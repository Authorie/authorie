import { createTRPCRouter } from "~/server/api/trpc";
import buyChapter from "./buyChapter";
import createChapter from "./createChapter";
import deleteDraftChapter from "./deleteDraft";
import getAllChapters from "./getAllChapters";
import getChapter from "./getChapter";
import getDraftChapters from "./getDrafts";
import getFeeds from "./getFeeds";
import getLeaderboard from "./getLeaderboard";
import like from "./like";
import readChapter from "./readChapter";
import unlike from "./unlike";
import getPurchased from "./getPurchased";

export const chapterRouter = createTRPCRouter({
  getAllChapters: getAllChapters,
  getPurchased: getPurchased,
  getFeeds: getFeeds,
  getData: getChapter,
  getDrafts: getDraftChapters,
  getLeaderboard: getLeaderboard,
  create: createChapter,
  deleteDraft: deleteDraftChapter,
  read: readChapter,
  like: like,
  unlike: unlike,
  buyChapter: buyChapter,
});
