import { type FC, useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ImageData {
  src: string;
  alt?: string;
  label?: string;
}

interface InfiniteScrollGalleryProps {
  images?: ImageData[];
  scrollSpeed?: number;
}

// ... (keep existing interfaces and constants) ...

// Customer memory photos from public/memories folder
const MEMORY_IMAGES: ImageData[] = [
  { src: '/memories/622053418_1372617564878272_8665739112050125720_n.jpg', alt: 'Happy Customer 1', label: 'Cebu Trip' },
  { src: '/memories/622590474_2074369719995679_4060973652471360895_n.jpg', alt: 'Happy Customer 2', label: 'Island Adventure' },
  { src: '/memories/623809740_25531247293227421_1023255353939186773_n.jpg', alt: 'Happy Customer 3', label: 'Beach Getaway' },
  { src: '/memories/625142606_914730327636854_7648819686795032889_n.jpg', alt: 'Happy Customer 4', label: 'Family Trip' },
  { src: '/memories/626751603_2080472402716484_5712831838357826546_n.jpg', alt: 'Happy Customer 5', label: 'Scenic Drive' },
  { src: '/memories/629238391_1270451841812252_3506399103069722613_n.jpg', alt: 'Happy Customer 6', label: 'Oslob Adventure' },
];

const InfiniteScrollGallery: FC<InfiniteScrollGalleryProps> = ({
  images = MEMORY_IMAGES,
  scrollSpeed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Auto-scroll animation
  useEffect(() => {
    const animate = () => {
      setScrollPosition((prev) => prev + scrollSpeed);
    };

    const intervalId = setInterval(animate, 16); // ~60fps

    return () => clearInterval(intervalId);
  }, [scrollSpeed]);

  // Reset scroll when reaching the end of the first set
  useEffect(() => {
    const scrollWidth = images.length * 260; // 240px width + 20px gap
    if (scrollPosition >= scrollWidth) {
      setScrollPosition(0);
    }
  }, [scrollPosition, images.length]);

  // Handle mouse move for flashlight effect - track raw client position
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, []);

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images, ...images];

  // Calculate clip-path position accounting for scroll offset
  // The color layer is translated by -scrollPosition, so we need to add scrollPosition to the mouse X
  const clipPathX = mousePosition.x + scrollPosition;
  const clipPathY = mousePosition.y;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        width: '100%',
        height: '350px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'none',
      }}
    >
      {/* Custom flashlight cursor */}
      {isHovering && (
        <div
          style={{
            position: 'fixed',
            left: mousePosition.x + (containerRef.current?.getBoundingClientRect().left || 0) - 10,
            top: mousePosition.y + (containerRef.current?.getBoundingClientRect().top || 0) - 10,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.8)',
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: '0 0 10px rgba(255,255,255,0.5)',
          }}
        />
      )}

      {/* Blur gradients on edges */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '200px',
          background: 'linear-gradient(to right, #0A0A0A 0%, transparent 100%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '200px',
          background: 'linear-gradient(to left, #0A0A0A 0%, transparent 100%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      />

      {/* Grayscale layer (visible by default) */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          transform: `translateX(-${scrollPosition}px)`,
          transition: 'none',
          paddingTop: '20px',
          paddingBottom: '20px',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={`gray-${index}`}
            style={{
              minWidth: '240px',
              height: '300px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              backgroundColor: '#1a1a1a',
              flexShrink: 0,
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'grayscale(100%)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Color layer (revealed by flashlight) - clip-path adjusted for scroll */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          transform: `translateX(-${scrollPosition}px)`,
          transition: 'none',
          paddingTop: '20px',
          paddingBottom: '20px',
          position: 'absolute',
          top: 0,
          left: 0,
          clipPath: isHovering
            ? `circle(100px at ${clipPathX}px ${clipPathY}px)`
            : 'circle(0px at 0px 0px)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={`color-${index}`}
            style={{
              minWidth: '240px',
              height: '300px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              backgroundColor: '#1a1a1a',
              flexShrink: 0,
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Infinite Scroll Gallery Section showcasing satisfied customers
 */
export const InfiniteScrollGallerySection: FC = () => {
  return (
    <section
      className="bg-[#0A0A0A] py-16 sm:py-24"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: '100vw' }}>
        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-white mb-16 text-center px-6"
        >
          Memories From Our Satisfied Customers
        </motion.h2>

        {/* Infinite Scroll Gallery with Flashlight Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <InfiniteScrollGallery />
        </motion.div>
      </div>
    </section>
  );
};
