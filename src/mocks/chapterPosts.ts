export const mockChapters = Array.from({ length: 10 }, (_, i) => ({
  bookTitle: "The Book",
  chapterNumber: i,
  chapterTitle: `Chapter ${i}`,
  publishDate: new Date(),
  content: `This is chapter ${i}`,
}));
