import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const categories: string[] = [
    "Programming",
    "Business",
    "Writing",
    "Fiction",
    "Non-fiction",
    "Horror",
    "Entertainment",
    "Study",
    "Animals and Pets",
    "Business and Economics",
    "Cryptocurrency",
    "Stock investment",
    "Technical Analysis",
    "Fundamental Analysis",
    "Fiction",
    "Non-fiction",
    "Horror",
    "Entertainment",
    "Study",
    "Animals and Pets",
    "Business and Economics",
    "Cryptocurrency",
    "Stock investment",
    "Technical Analysis",
    "Fundamental Analysis",
  ];
  await prisma.category.createMany({
    data: categories.map((category) => ({
      name: category,
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
