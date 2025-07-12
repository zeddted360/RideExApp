import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import Image from "next/image";

export default function Hero({
  setIsMobile,
  isMobile,
}: {
  setIsMobile: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile]);

  // Don't render mobile-specific content until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-fit bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 md:pb-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br rounded-xl from-orange-400 via-red-400 to-pink-400 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-2 gap-8 items-center">
              {/* Hero Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                  <span className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  50% OFF
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  <span className="block">BEST</span>
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    OFFER
                  </span>
                </h1>

                <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium">
                  Tasty Fast Food
                </p>

                <div className="flex flex-col sm:flex-row gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Open Everyday</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-200">10:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-orange-200">Free Home Delivery</span>
                  </div>
                </div>

                <button className="bg-white text-orange-500 px-6 py-2 sm:px-8 sm:py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 hover:scale-105 shadow-lg">
                  Order Now
                </button>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent rounded-3xl"></div>
                <div className="grid grid-cols-2 gap-3 p-3">
                  <div className="space-y-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full h-16 rounded-lg mb-2 overflow-hidden">
                        <Image
                          src="/jellof-rice.webp"
                          alt="Spicy Jollof"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          quality={100}
                          priority
                        />
                      </div>
                      <p className="text-xs font-medium">Spicy Jollof</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full h-16 rounded-lg mb-2 overflow-hidden">
                        <Image
                          src="/grilled-fish.webp"
                          alt="Grilled Fish"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          quality={100}
                          priority
                        />
                      </div>
                      <p className="text-xs font-medium">Grilled Fish</p>
                    </div>
                  </div>
                  <div className="space-y-3 mt-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full h-16 rounded-lg mb-2 overflow-hidden">
                        <Image
                          src="/Goat-meat-pepper-soup.webp"
                          alt="Pepper Soup"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          quality={100}
                          priority
                        />
                      </div>
                      <p className="text-xs font-medium">Pepper Soup</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full h-16 rounded-lg mb-2 overflow-hidden">
                        <Image
                          src="/fried-rice-and-egg.webp"
                          alt="Fried Rice"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          quality={100}
                          priority
                        />
                      </div>
                      <p className="text-xs font-medium">Fried Rice</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-fit bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 md:pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br rounded-xl from-orange-400 via-red-400 to-pink-400 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 gap-8 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <span className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                50% OFF
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="block">BEST</span>
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  OFFER
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium">
                Tasty Fast Food
              </p>

              <div className="flex flex-col sm:flex-row gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Open Everyday</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-200">10:00 AM - 11:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-orange-200">Free Home Delivery</span>
                </div>
              </div>

              <button className="bg-white text-orange-500 px-6 py-2 sm:px-8 sm:py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 hover:scale-105 shadow-lg">
                Order Now
              </button>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent rounded-3xl"></div>
              <div className="grid grid-cols-2 gap-3 p-3">
                <div className="space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="relative w-full h-16 rounded-lg mb-2 overflow-hidden">
                      <Image
                        src="/jellof-rice.webp"
                        alt="Spicy Jollof"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        quality={100}
                        priority
                      />
                    </div>
                    <p className="text-xs font-medium">Spicy Jollof</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="relative w-full h-16 rounded-lg mb-2 overflow-hidden">
                      <Image
                        src="/grilled-fish.webp"
                        alt="Grilled Fish"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        quality={100}
                        priority
                      />
                    </div>
                    <p className="text-xs font-medium">Grilled Fish</p>
                  </div>
                </div>
                <div className="space-y-3 mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="relative w-full h-16 rounded-lg mb-2 overflow-hidden">
                      <Image
                        src="/Goat-meat-pepper-soup.webp"
                        alt="Pepper Soup"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        quality={100}
                        priority
                      />
                    </div>
                    <p className="text-xs font-medium">Pepper Soup</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="relative w-full h-16 rounded-lg mb-2 overflow-hidden">
                      <Image
                        src="/fried-rice-and-egg.webp"
                        alt="Fried Rice"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                        quality={100}
                        priority
                      />
                    </div>
                    <p className="text-xs font-medium">Fried Rice</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
