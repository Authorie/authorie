import { useState } from "react";
import NewUserForm from "~/components/NewUser/NewUserForm";
import UserTutorial from "~/components/NewUser/UserTutorial";
import { HiArrowLeft } from "react-icons/hi2";

const NewUser = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const slides = [
    {
      id: 1,
      title: "Welcome to Authorie",
      description:
        "In Authorie, you can create books and chapters or invite other people to write a book with you!",
      buttonName: "Start Tutorial",
      buttonColor: "blue",
    },
    {
      id: 2,
      title: "Book State",
      description:
        "There are 4 main book state in Authorie and each state function differently",
      buttonName: "Next",
      buttonColor: "gray",
    },
    {
      id: 3,
      title: "Initial State",
      description:
        "You can invite authors to write with you only in this state, but you will not be able to write anything yet. Now click this button to start writing the book",
      buttonName: "Start Writing",
      buttonColor: "blue",
    },
    {
      id: 4,
      title: "Draft State",
      description:
        "Now, you can write and save as many chapters as you want and readers cannot see your book yet. Click on this button so that everyone can see your book.",
      buttonName: "Publish",
      buttonColor: "green",
    },
    {
      id: 5,
      title: "Publish State",
      description:
        "Everyone can see your book now. You can start publish chapters. After you finished writing this book, you can click this button!",
      buttonName: "Complete",
      buttonColor: "gray",
    },
    {
      id: 6,
      title: "Complete State",
      description:
        "Right now, the user know that your book has been completed. At the same time, you will no longer be able to add more chapters and cannot reverse the state back to publish",
      buttonName: "Archive",
      buttonColor: "red",
    },
    {
      id: 7,
      title: "Archive and Delete",
      description:
        "You can archive your book on publish and complete state and delete your book on initial state and draft state",
      buttonName: "Next",
      buttonColor: "gray",
    },
    {
      id: 8,
      title: "Now you are ready to create your first book and chapter!",
      description: "",
      buttonName: "Let's go",
      buttonColor: "green",
    },
  ];

  const goToSlide = (id: number) => {
    setCurrentSlide(id);
  };

  const nextSlide = () => {
    setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 1 ? currentSlide : currentSlide - 1);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {currentSlide !== 1 && (
        <div
          onClick={prevSlide}
          className="absolute left-32 top-40 z-50 flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-200"
        >
          <HiArrowLeft className="h-6 w-6" />
          <span className="text-lg font-semibold">back</span>
        </div>
      )}
      {slides.map((tutorial) => (
        <div
          key={tutorial.id}
          className={`absolute inset-0 flex h-full w-full items-center justify-center bg-cover bg-center transition-transform duration-500 ${
            tutorial.id === currentSlide
              ? "translate-x-0 transform"
              : tutorial.id < currentSlide
              ? "-translate-x-full transform"
              : "translate-x-full transform"
          }`}
        >
          <UserTutorial
            title={tutorial.title}
            description={tutorial.description}
            buttonName={tutorial.buttonName}
            buttonColor={tutorial.buttonColor}
            onClick={nextSlide}
          />
        </div>
      ))}
      <div
        className={`absolute inset-0 flex h-full w-full items-center justify-center bg-cover bg-center transition-transform duration-500 ${
          9 === currentSlide
            ? "translate-x-0 transform"
            : 9 < currentSlide
            ? "-translate-x-full transform"
            : "translate-x-full transform"
        }`}
      >
        <NewUserForm />
      </div>
      <div className="absolute bottom-32 z-50 flex w-full items-center justify-center gap-4">
        {slides.map((slide) => (
          <button
            key={slide.id}
            className={`h-3 w-3 rounded-full border border-gray-300 hover:opacity-70 focus:outline-none ${
              slide.id === currentSlide ? "bg-gray-300" : ""
            }`}
            onClick={() => goToSlide(slide.id)}
          ></button>
        ))}
        <button
          className={`h-3 w-3 rounded-full border border-gray-300 hover:opacity-70 focus:outline-none ${
            9 === currentSlide ? "bg-gray-300" : ""
          }`}
          onClick={() => goToSlide(9)}
        ></button>
      </div>
    </div>
  );
};

export default NewUser;
