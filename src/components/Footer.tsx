"use client";

import Link from "next/link";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Download,
  Star,
  Heart,
  Shield,
  Truck,
  CreditCard,
} from "lucide-react";
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
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)] bg-[length:20px_20px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                RideEx
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your trusted food delivery platform. Fast, reliable, and delicious
              meals delivered right to your doorstep.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-4 h-4 text-orange-400" />
                <span className="text-sm">+234 801 234 5678</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-4 h-4 text-orange-400" />
                <span className="text-sm">support@rideex.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home", icon: "🏠" },
                { href: "/menu", label: "Menu", icon: "🍽️" },
                { href: "/offers", label: "Offers", icon: "🎉" },
                { href: "/myorders", label: "My Orders", icon: "📋" },
                { href: "/address", label: "Address", icon: "📍" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 transition-all duration-300 group"
                  >
                    <span className="text-sm">{link.icon}</span>
                    <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Our Services</h3>
            <ul className="space-y-3">
              {[
                {
                  icon: Truck,
                  label: "Fast Delivery",
                  desc: "30 minutes or free",
                },
                { icon: Shield, label: "Secure Payment", desc: "100% secure" },
                {
                  icon: Star,
                  label: "Quality Food",
                  desc: "Fresh ingredients",
                },
                { icon: Heart, label: "Customer Care", desc: "24/7 support" },
              ].map((service, index) => (
                <li key={index}>
                  <div className="flex items-center space-x-3 text-gray-300 hover:text-orange-400 transition-all duration-300 group">
                    <service.icon className="w-4 h-4 text-orange-400" />
                    <div>
                      <div className="text-sm font-medium">{service.label}</div>
                      <div className="text-xs text-gray-400">
                        {service.desc}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Stay Connected</h3>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                Subscribe to our newsletter for exclusive offers and updates.
              </p>
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
                    className="w-full pr-12 pl-4 py-3 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm backdrop-blur-sm"
                    aria-label="Email for newsletter"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-2 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                {emailError && (
                  <p className="text-red-400 text-xs">{emailError}</p>
                )}
              </form>
            </div>

            {/* Social Media */}
            <div className="space-y-3">
              <p className="text-sm text-gray-300">Follow us on social media</p>
              <div className="flex space-x-3">
                {[
                  {
                    href: "https://instagram.com",
                    Icon: Instagram,
                    label: "Instagram",
                    color: "hover:text-pink-400",
                  },
                  {
                    href: "https://twitter.com",
                    Icon: Twitter,
                    label: "Twitter",
                    color: "hover:text-blue-400",
                  },
                  {
                    href: "https://facebook.com",
                    Icon: Facebook,
                    label: "Facebook",
                    color: "hover:text-blue-600",
                  },
                  {
                    href: "https://youtube.com",
                    Icon: Youtube,
                    label: "YouTube",
                    color: "hover:text-red-500",
                  },
                ].map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 ${social.color} group`}
                    aria-label={social.label}
                  >
                    <social.Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* App Download */}
            <div className="flex flex-col sm:flex-row gap-4">
              <p className="text-sm text-gray-300 font-medium">
                Download our app
              </p>
              <div className="flex space-x-3">
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
                    className="group"
                  >
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                      <Image
                        src={store.image}
                        alt={store.label}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                      <div className="text-left">
                        <div className="text-xs text-gray-400">Download on</div>
                        <div className="text-sm font-medium text-white">
                          {store.label}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
              <p>© {new Date().getFullYear()} RideEx. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <Link
                  href="/privacy"
                  className="hover:text-orange-400 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-orange-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
