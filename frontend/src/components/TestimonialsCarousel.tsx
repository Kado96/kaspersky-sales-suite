import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Testimonial } from '../lib/siteConfig';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ testimonials }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Auto-play effect
  useEffect(() => {
    if (!emblaApi) return;

    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(intervalId);
  }, [emblaApi]);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className="w-full py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">AVIS DE NOS CLIENTS</h2>
          <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="relative group/carousel">
          {/* Navigation Buttons */}
          <button 
            onClick={scrollPrev}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 p-2 bg-background/80 border border-border rounded-full text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:block hover:bg-primary hover:text-black"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={scrollNext}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 p-2 bg-background/80 border border-border rounded-full text-primary opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden sm:block hover:bg-primary hover:text-black"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] min-w-0">
                  <div className="glass-card p-6 rounded-2xl border border-border/50 h-full flex flex-col relative group hover:border-primary/30 transition-all duration-500">
                    <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                    
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={`w-3.5 h-3.5 ${idx < t.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>

                    <p className="text-sm text-foreground/80 leading-relaxed italic mb-6 flex-grow">
                      "{t.content}"
                    </p>

                    <div className="pt-4 border-t border-border/50">
                      <div className="font-bold text-sm text-primary">{t.name}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium mt-0.5">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
