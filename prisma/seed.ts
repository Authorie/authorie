import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const categories: string[] = [
    "Diary",
    "Non-Fiction",
    "Fiction",
    "Self-help",
    "Technology and Computing",
    "Programming",
    "Robotics and AI",
    "Business",
    "Investment",
    "Stock Investing",
    "Fundamental analysis",
    "Technical analysis",
    "Cryptocurrency",
    "Forex",
    "Health and Wellness",
    "Children’s",
    "Mystery and Thriller",
    "Travel",
    "Cookbooks",
    "History",
    "Biography Philosophy",
    "Religion and Spirituality",
    "Art and Photography",
    "Music",
    "Sports",
    "Science",
    "Psychology",
    "Education",
    "Politics and Current Events",
    "Reference and Dictionaries",
    "DIY and Crafts",
    "Gardening",
    "Comics and Graphic Novels",
    "Poetry",
    "Drama",
    "Romance",
    "Horror",
    "Memoirs",
    "Humor",
    "Nature and Environment",
    "Parenting and Family",
    "LGBTQ+",
    "Cultural Studies",
    "Linguistics",
  ];
  await prisma.category.createMany({
    data: categories.map((category) => ({
      title: category,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
