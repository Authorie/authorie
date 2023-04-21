import Image from "next/image";
import Link from "next/link";
import { HiEnvelope } from "react-icons/hi2";
import DeveloperInfoCard from "~/components/Card/DeveloperInfoCard";

const HomePage = () => {
  return (
    <div className="mt-20 h-full">
      <div className="relative flex h-96 flex-col items-center justify-center gap-3">
        <Image
          src="/wallpaper1.png"
          alt="wallpaper1"
          className="absolute -z-10"
          priority
          fill
        />
        <h1 className="text-4xl font-bold">Welcome to Authorie</h1>
        <p>A publishing and social media platform</p>
        <button className="h-10 w-28 cursor-pointer rounded-lg border-2 border-white font-semibold text-white hover:bg-authGreen-400 hover:text-white">
          <Link href="/">Get Started</Link>
        </button>
      </div>
      <div className="flex items-center justify-center gap-10 bg-white px-36 py-12">
        <h2 className="text-3xl font-bold">Our team</h2>
        <DeveloperInfoCard
          name={"Siriwudhi Sawaidee"}
          img={"/FamePicture.png"}
          position={"Lead Developer, Full-stack Developer"}
          quote={"All your journey can be kept in Authorie forever"}
          email={"swsd2544@gmail.com"}
        />
        <DeveloperInfoCard
          name={"Supakit Kuewsupakorn"}
          img={"/FourPicture.png"}
          position={"Project Manager, Frontend Developer"}
          quote={"I hope you guys enjoy our website!"}
          email={"four.music@hotmail.com"}
        />
        <DeveloperInfoCard
          name={"Supakorn Suvichai"}
          img={"/KenPicture.png"}
          position={"Researcher, Frontend-Developer"}
          quote={"I love penguin"}
          email={"droidakaken@gmail.com"}
        />
      </div>
      <div className="relative py-8">
        <div className="ml-52 flex pb-5">
          <h2 className="rounded-full bg-authGreen-600 px-8 py-2 text-3xl font-semibold text-white">
            Your journey
          </h2>
        </div>
        <Image
          src="/wallpaper2.png"
          alt="wallpaper2"
          fill
          className="absolute bottom-0 -z-10"
        />
        <div className="flex w-full items-center justify-center gap-14 px-32 pb-10 pt-5">
          <div className="h-64 w-96 bg-white" />
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold">Create your first book</h3>
            <p className="w-96">
              Simply, adding title, picture, and description and now you have
              your first book.
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-14 px-32 py-10">
          <div className="flex w-96 flex-col gap-3">
            <h3 className="text-2xl font-semibold">
              Invite your friends to write a book with you
            </h3>
            <p className="w-96">
              You are allow to add as many friends as you want to write a book
              with you.
            </p>
          </div>
          <div className="h-64 w-96 bg-white" />
        </div>
        <div className="flex w-full items-center justify-center gap-14 px-32 py-10">
          <div className="h-64 w-96 bg-white" />
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-semibold">
              Create your first chapter
            </h3>
            <p className="w-96">
              Your writing content is customizable. Moreover, you can set the
              date when you want to publish your chapter and it will be
              published automatically.
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-14 px-32 py-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Read other people books</h2>
            <p className="w-96">
              You can highlight the text and customize the font as you like and
              connect with other people.
            </p>
          </div>
          <div className="h-64 w-96 bg-white" />
        </div>
      </div>
      <div className="relative flex h-[450px] w-full flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-semibold">Book State</h1>
        <p className="mb-8 text-sm text-gray-500">
          there are 4 states in the book
        </p>
        <div className="flex gap-8">
          <div className="flex h-72 w-64 flex-col items-center justify-start gap-3 bg-white px-6 pt-16 shadow-lg">
            <h4 className="text-lg font-semibold">1. Initial</h4>
            <p className="text-center text-gray-500">
              Initial state is a phase where you can still invite other author
              to write a book with you before starting the book
            </p>
          </div>
          <div className="flex h-72 w-64 flex-col items-center justify-start gap-3 bg-white px-6 pt-16 shadow-lg">
            <h4 className="text-lg font-semibold">2. Draft</h4>
            <p className="text-center text-gray-500">
              Draft state allows you to write as many chapters as you want and
              put it into the book while no one will be able the book yet.
            </p>
          </div>
          <div className="flex h-72 w-64 flex-col items-center justify-start gap-3 bg-white px-6 pt-16 shadow-lg">
            <h4 className="text-lg font-semibold">3. Publish</h4>
            <p className="text-center text-gray-500">
              Publish state is when you decide to share the book to public. You
              can still add more chapters to your book.
            </p>
          </div>
          <div className="flex h-72 w-64 flex-col items-center justify-start gap-3 bg-white px-6 pt-16 shadow-lg">
            <h4 className="text-lg font-semibold">4. Complete</h4>
            <p className="text-center text-gray-500">
              When you think the book is done. You can complete the book and no
              chapters will be added anymore.
            </p>
          </div>
        </div>
      </div>
      <div className="flex h-[150px] flex-col items-center justify-center bg-authGreen-300">
        <h2 className="text-4xl font-semibold">Contact us</h2>
        <div className="mt-4 flex items-center gap-2">
          <HiEnvelope className="h-5 w-5" />
          <p className="text-sm">authorie.co@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
