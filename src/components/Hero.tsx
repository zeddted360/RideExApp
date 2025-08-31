import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import {useRouter} from "next/navigation";

export default function Hero({
  setIsMobile,
  isMobile,
}: {
  setIsMobile: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
}) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [setIsMobile]);

  if (!isClient) {
    return (
      <div className="min-h-fit bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 md:pb-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br rounded-xl from-orange-400 via-red-400 to-pink-400 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Hero Content */}
              <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
                  <span className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  50% OFF
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                  <span className="block">BEST</span>
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    OFFER
                  </span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/90 font-medium">
                  Tasty Fast Food
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm justify-center lg:justify-start">
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <Clock className="w-4 h-4" />
                    <span>Open Everyday</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <span className="text-orange-200">10:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <MapPin className="w-4 h-4" />
                    <span className="text-orange-200">Free Home Delivery</span>
                  </div>
                </div>

                <button onClick={()=>router.push("/vendor/register")} className="bg-white cursor-pointer text-orange-500 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 hover:scale-105 shadow-lg">
                  Join as a Vendor
                </button>
              </div>

              {/* Hero Image */}
              <div className="relative order-first lg:order-last">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent rounded-3xl"></div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-3">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full h-12 sm:h-16 rounded-lg mb-1 sm:mb-2 overflow-hidden">
                        <Image
                          src="/jellof-rice.webp"
                          alt="Spicy Jollof"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          quality={100}
                          priority
                        />
                      </div>
                      <p className="text-xs font-medium truncate">
                        Spicy Jollof
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full h-12 sm:h-16 rounded-lg mb-1 sm:mb-2 overflow-hidden">
                        <Image
                          src="/grilled-fish.webp"
                          alt="Grilled Fish"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          quality={100}
                          priority
                        />
                      </div>
                      <p className="text-xs font-medium truncate">
                        Grilled Fish
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full h-12 sm:h-16 rounded-lg mb-1 sm:mb-2 overflow-hidden">
                        <Image
                          src="/Goat-meat-pepper-soup.webp"
                          alt="Pepper Soup"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          quality={100}
                          priority
                        />
                      </div>
                      <p className="text-xs font-medium truncate">
                        Pepper Soup
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="relative w-full h-12 sm:h-16 rounded-lg mb-1 sm:mb-2 overflow-hidden">
                        <Image
                          src="/fried-rice-and-egg.webp"
                          alt="Fried Rice"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                          quality={100}
                          priority
                        />
                      </div>
                      <p className="text-xs font-medium truncate">Fried Rice</p>
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Hero Content */}
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
                <span className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                50% OFF
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                <span className="block">BEST</span>
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  OFFER
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/90 font-medium">
                Tasty Fast Food
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm justify-center lg:justify-start">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Clock className="w-4 h-4" />
                  <span>Open Everyday</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <span className="text-orange-200">10:00 AM - 11:00 PM</span>
                </div>
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <MapPin className="w-4 h-4" />
                  <span className="text-orange-200">Free Home Delivery</span>
                </div>
              </div>
              <button onClick={()=>router.push("/vendor/register")} className="bg-white cursor-pointer text-orange-500 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 hover:scale-105 shadow-lg">
                  Join as a Vendor
                </button>
            </div>

            {/* Hero Image */}
            <div className="relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent rounded-3xl"></div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 p-2 sm:p-3">
                <div className="space-y-2 sm:space-y-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="relative w-full h-12 sm:h-16 rounded-lg mb-1 sm:mb-2 overflow-hidden">
                      <Image
                        src="/jellof-rice.webp"
                        alt="Spicy Jollof"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        quality={100}
                        priority
                      />
                    </div>
                    <p className="text-xs font-medium truncate">Spicy Jollof</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="relative w-full h-12 sm:h-16 rounded-lg mb-1 sm:mb-2 overflow-hidden">
                      <Image
                        src="/grilled-fish.webp"
                        alt="Grilled Fish"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        quality={100}
                        priority
                      />
                    </div>
                    <p className="text-xs font-medium truncate">Grilled Fish</p>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="relative w-full h-12 sm:h-16 rounded-lg mb-1 sm:mb-2 overflow-hidden">
                      <Image
                        src="/Goat-meat-pepper-soup.webp"
                        alt="Pepper Soup"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        quality={100}
                        priority
                      />
                    </div>
                    <p className="text-xs font-medium truncate">Pepper Soup</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    <div className="relative w-full h-12 sm:h-16 rounded-lg mb-1 sm:mb-2 overflow-hidden">
                      <Image
                        src="/fried-rice-and-egg.webp"
                        alt="Fried Rice"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 25vw"
                        quality={100}
                        priority
                      />
                    </div>
                    <p className="text-xs font-medium truncate">Fried Rice</p>
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
