import { type FC, type ReactNode, useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

/**
 * Main layout wrapper component with 4K scaling support
 * Scales content proportionally from 1920px base to larger screens
 */
export const MainLayout: FC<MainLayoutProps> = ({ children, hideFooter = false }) => {
  const [scale, setScale] = useState(1);
  const baseWidth = 1920;

  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      if (viewportWidth > baseWidth) {
        // Scale up proportionally for screens larger than 1920px
        setScale(viewportWidth / baseWidth);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div 
      className="flex min-h-screen flex-col"
      style={{
        width: scale > 1 ? `${baseWidth}px` : '100%',
        transform: scale > 1 ? `scale(${scale})` : 'none',
        transformOrigin: 'top left',
      }}
    >
      <Header />
      {/* Spacer for fixed header: TopBar (40px on desktop, 0 on mobile) + Nav (80px) */}
      <div className="h-[80px] lg:h-[120px]" />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
