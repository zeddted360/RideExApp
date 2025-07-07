"use client";

import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ChangeEvent, useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");
    console.log(`Subscribing with email: ${email}`);
    setEmail("");
    // Add your subscription logic here
  };

  return (
    <footer className="bg-orange-500 dark:bg-orange-700 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">FoodieHub</h2>
            <p className="text-sm leading-relaxed opacity-90">
              Discover delicious meals and culinary inspiration with FoodieHub.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: "/menu", label: "Menu" },
                { href: "/orders", label: "Orders" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-orange-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {[
                {
                  href: "https://instagram.com",
                  Icon: Instagram,
                  label: "Instagram",
                },
                {
                  href: "https://twitter.com",
                  Icon: Twitter,
                  label: "Twitter",
                },
                {
                  href: "https://facebook.com",
                  Icon: Facebook,
                  label: "Facebook",
                },
              ].map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-200 transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder="Enter your email"
                  className="w-full pr-32 pl-4 py-2 text-gray-900 rounded-full focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 text-sm"
                  aria-label="Email for newsletter"
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-1 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm hover:shadow-md text-sm"
                  aria-label="Subscribe to newsletter"
                >
                  Subscribe
                </Button>
              </div>
              {emailError && (
                <p className="text-red-200 text-xs mt-1">{emailError}</p>
              )}
            </form>
          </div>
        </div>

        {/* App Download */}
        <div className="mt-12 border-t border-orange-300 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex space-x-4">
            {[
              {
                href: "https://play.google.com",
                label: "Google Play",
                aria: "Download from Google Play",
                image: "/play-store.png",
              },
              {
                href: "https://www.apple.com/app-store",
                label: "App Store",
                aria: "Download from App Store",
                image: "/app-store.png",
              },
            ].map((store) => (
              <a
                key={store.href}
                href={store.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm hover:shadow-lg flex items-center space-x-2"
                  aria-label={store.aria}
                >
                  <Image
                    src={store.image}
                    alt={store.label}
                    width={32}
                    height={32}
                    className="object-contain"
                    placeholder="blur"
                    blurDataURL="/placeholder.png" // Optional: add a placeholder image
                  />
                  <span className="text-sm">{store.label}</span>
                </Button>
              </a>
            ))}
          </div>
          <p className="text-sm opacity-90">
            © FoodieHub {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
