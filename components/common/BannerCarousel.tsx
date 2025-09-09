import React, { useState, useEffect, useCallback } from 'react';
import type { Banner, CTAButton } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;

interface BannerCarouselProps {
  banner: Banner;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banner }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t_dynamic } = useI18n();
  const { user } = useAuth();

  const { slides, config } = banner;

  const fontClasses = {
    'sans': 'font-sans',
    'montserrat': 'font-montserrat',
    'roboto-slab': 'font-roboto-slab'
  };

  const sizeClasses: { [key in CTAButton['size']]: string } = {
    sm: 'px-6 py-2 text-sm',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  const borderRadiusClasses: { [key in CTAButton['borderRadius']]: string } = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const textShadowStyle = config.textShadow
    ? { textShadow: '0 2px 4px rgba(0,0,0,0.5)' }
    : {};
  
  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = useCallback(() => {
    if(!config.loop && currentIndex === slides.length - 1) return;
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, slides, config.loop]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (config.autoplay && slides.length > 1) {
      const timer = setTimeout(goToNext, config.interval);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, goToNext, config.autoplay, config.interval, slides.length]);
  
  const shouldShowButton = (button: CTAButton) => {
    if (!button.showTo || button.showTo.length === 0) {
      return true; // If showTo is not defined or is empty, show to everyone.
    }
    const userRole = user ? user.role : 'guest';
    return button.showTo.includes(userRole);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${fontClasses[config.fontFamily] || 'font-sans'}`}
      style={{ height: `${config.height_px || 600}px` }}
    >
      {/* Slides container */}
       <div className="w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 h-full w-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-[10]' : 'opacity-0 z-0'}`}
            style={{ 
                backgroundImage: `url(${slide.imageUrl})`,
                transition: config.transition === 'fade' ? 'opacity 1s ease-in-out' : 'transform 0.7s ease-in-out',
                transform: config.transition === 'slide' ? `translateX(${(index - currentIndex) * 100}%)` : 'none',
             }}
          >
            <div 
              className="absolute inset-0 z-10"
              style={{
                  backgroundColor: config.overlayColor || '#000000',
                  opacity: config.overlayOpacity === undefined ? 0.5 : config.overlayOpacity
              }}
            ></div>
            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center text-white p-4">
              <h1 style={textShadowStyle} className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{t_dynamic(slide.title)}</h1>
              <p style={textShadowStyle} className="mt-6 max-w-2xl mx-auto text-xl">{t_dynamic(slide.subtitle)}</p>
              {slide.ctaButtons && slide.ctaButtons.length > 0 && (
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {slide.ctaButtons.filter(shouldShowButton).map((button: CTAButton) => (
                    <Link to={button.link} key={button.id}>
                       <span
                          style={{ 
                              backgroundColor: button.backgroundColor, 
                              color: button.textColor 
                          }}
                          className={`inline-block font-semibold shadow-md transition-transform transform hover:-translate-y-px active:scale-[0.98] ${sizeClasses[button.size]} ${borderRadiusClasses[button.borderRadius]}`}
                      >
                          {t_dynamic(button.text)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      {config.showArrows && slides.length > 1 && (
        <>
          <button onClick={goToPrevious} className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition">
            &#10094;
          </button>
          <button onClick={goToNext} className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition">
            &#10095;
          </button>
        </>
      )}

      {/* Dots */}
      {config.showDots && slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {slides.map((_, slideIndex) => (
            <button
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`h-3 w-3 rounded-full transition ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Go to slide ${slideIndex + 1}`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};