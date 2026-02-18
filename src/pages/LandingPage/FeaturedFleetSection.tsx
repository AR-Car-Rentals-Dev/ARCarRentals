import { type FC, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CarCard, VehicleDetailsModal } from '@/components/ui';
import { supabase } from '@services/supabase';
import type { Car } from '@/types';
import { updateVehicle, getSession, initSession } from '@/utils/sessionManager';

/**
 * Featured Fleet section - Dynamically loads featured vehicles from database
 */
export const FeaturedFleetSection: FC = () => {
  const navigate = useNavigate();
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured vehicles from database
  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      setIsLoading(true);
      try {
        const { data: vehicles, error } = await supabase
          .from('vehicles')
          .select(`
            id,
            brand,
            model,
            category_id,
            price_per_day,
            seats,
            transmission,
            fuel_type,
            image_url,
            features,
            status,
            vehicle_categories (
              name
            )
          `)
          .eq('is_featured', true)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) {
          console.error('Error fetching featured vehicles:', error);
          setFeaturedCars([]);
          return;
        }

        // Transform database format to Car type
        const transformed: Car[] = (vehicles || []).map((v: any) => ({
          id: v.id,
          name: `${v.brand} ${v.model}`,
          brand: v.brand,
          model: v.model,
          year: new Date().getFullYear(), // Current year as default
          category: v.vehicle_categories?.name || 'SUV',
          pricePerDay: v.price_per_day,
          currency: 'PHP',
          seats: v.seats || '5',
          transmission: v.transmission,
          fuelType: v.fuel_type,
          image: v.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
          images: [],
          features: Array.isArray(v.features) ? v.features : [],
          available: v.status === 'available',
          rating: 4.8,
          reviewCount: 0,
        }));

        setFeaturedCars(transformed);
      } catch (err) {
        console.error('Error loading featured vehicles:', err);
        setFeaturedCars([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedVehicles();
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const session = getSession();
    if (!session.sessionId) {
      initSession();
    }
  }, []);

  const handleBookNow = (car: Car) => {
    setSelectedCar(car);
    setIsVehicleDetailsModalOpen(true);
  };

  const handleProceedToBooking = async () => {
    if (!selectedCar) return;

    // Save vehicle to session
    await updateVehicle(selectedCar);

    // Close modal
    setIsVehicleDetailsModalOpen(false);

    // Navigate to booking page with vehicle data
    navigate('/browsevehicles/booking', {
      state: {
        vehicle: selectedCar,
      },
    });
  };

  const handleCloseVehicleDetails = () => {
    setIsVehicleDetailsModalOpen(false);
    setSelectedCar(null);
  };

  return (
    <section
      className="bg-white py-16 sm:py-24"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Discover Your Perfect Ride Today
            </h2>
          </div>
          <Link
            to="/browsevehicles"
            className="text-neutral-900 font-medium hover:text-[#E22B2B] transition-colors inline-flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Cars Grid - responsive */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-100 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : featuredCars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 text-lg">No featured vehicles available at the moment.</p>
            <Link
              to="/browsevehicles"
              className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              Browse all vehicles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {featuredCars.map((car) => (
              <motion.div
                key={car.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
              >
                <CarCard
                  car={car}
                  onBookNow={handleBookNow}
                  showAvailability
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal
        isOpen={isVehicleDetailsModalOpen}
        onClose={handleCloseVehicleDetails}
        onProceedToBooking={handleProceedToBooking}
        vehicle={selectedCar ? {
          id: selectedCar.id,
          name: selectedCar.name,
          brand: selectedCar.brand,
          model: selectedCar.model,
          year: selectedCar.year,
          category: selectedCar.category,
          pricePerDay: selectedCar.pricePerDay,
          seats: selectedCar.seats,
          transmission: selectedCar.transmission,
          fuelType: selectedCar.fuelType,
          image: selectedCar.image,
          images: selectedCar.images,
          features: selectedCar.features,
        } : null}
      />
    </section>
  );
};

export default FeaturedFleetSection;
