import React, { useState } from "react";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      text: "Slide 1",
      imageUrl: "https://picsum.photos/800/600?random=1",
    },
    {
      id: 2,
      text: "Slide 2",
      imageUrl: "https://picsum.photos/800/600?random=2",
    },
    {
      id: 3,
      text: "Slide 3",
      imageUrl: "https://picsum.photos/800/600?random=3",
    },
  ];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  const sliderContent = (
    <div className="relative h-80 w-96 overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-96 transition-transform duration-500">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute left-0 top-0 h-full w-96 bg-cover bg-center transition-transform duration-500 ${
              index === currentSlide
                ? "translate-x-0 transform"
                : index < currentSlide
                ? "-translate-x-full transform"
                : "translate-x-full transform"
            }`}
            style={{ backgroundImage: `url(${slide.imageUrl})` }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center text-white">
              <h3 className="text-4xl font-bold">{slide.text}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center justify-center">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white hover:opacity-70 focus:outline-none"
          onClick={prevSlide}
        >
          &#10094;
        </button>
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`mx-2 h-3 w-3 rounded-full bg-gray-800 hover:opacity-70 focus:outline-none ${
              index === currentSlide ? "bg-white" : ""
            }`}
            onClick={() => goToSlide(index)}
          ></button>
        ))}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white hover:opacity-70 focus:outline-none"
          onClick={nextSlide}
        >
          &#10095;
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h1>Slider Example</h1>
      <button onClick={nextSlide}>Change Slide</button>
      {sliderContent}
    </div>
  );
};

export default Slider;
