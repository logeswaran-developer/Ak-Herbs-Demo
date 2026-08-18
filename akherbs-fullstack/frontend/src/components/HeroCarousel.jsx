import { useEffect, useState } from 'react';
import '../styles/HeroCarousel.css';

const slides = [
  '/images/carousel/slide-1.png',
  '/images/carousel/slide-2.png',
  '/images/carousel/slide-3.png',
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero-carousel">
      <div
        className="hero-carousel-track"
        style={{
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {slides.map((image, index) => (
          <div
            className="hero-carousel-slide"
            key={image}
          >
            <img
              src={image}
              alt={`AK Herbs banner ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="hero-carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={
              current === index ? 'active' : ''
            }
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </section>
  );
}