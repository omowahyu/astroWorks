
// import AppLogoIcon from '@/components/AppLogoIcon'; // File tidak ada
import { Link, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

const Header = () => {
    const { props } = usePage();
    const whatsappNumber = props.env?.WHATSAPP_NUMBER || '6281312312312';

    return (
        <header className="md:sticky w-full md:top-0 z-60 bg-gradient-to-b from-[#5EC2DB] to-[#5F44F0] lg:shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:relative flex flex-col lg:flex-row items-center justify-center py-2 lg:py-8">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 mt-4 lg:mt-0">
                        <a href="/" className="flex items-center">
                            <img src='/images/logo/astrokabinet.svg' alt="Astro Works Logo" className="h-4 lg:h-5 mb-2 lg:ml-2" />
                        </a>
                    </div>
                    {/* Bilah Navigasi */}
                    <nav className="lg:absolute flex justify-around w-full lg:w-fit items-center lg:gap-10 text-white lg:right-0 mt-4 lg:mt-0">
                        {/* Company */}
                        <a href="/company" className="flex flex-col items-center hover:text-primary/80 transition-colors duration-200">
                            <img src='/images/icons/company.svg' alt="Company" className="h-5 mb-1" />
                            <span className="text-xs lg:text-sm">Company</span>
                        </a>

                        {/* Tutorial */}
                        <a href="/" className="flex flex-col items-center hover:text-primary/80 transition-colors duration-200">
                            <img src='/images/icons/tutorial.svg' alt="Tutorial" className="h-5 mb-1" />
                            <span className="text-xs lg:text-sm">Tutorial</span>
                        </a>

                        {/* Chat */}
                        <a href={`https://wa.me/${whatsappNumber}`} className="flex flex-col items-center hover:text-primary/80 transition-colors duration-200">
                            <img src='/images/icons/chat.svg' alt="Chat" className="h-5 mb-1" />
                            <span className="text-xs lg:text-sm">Chat</span>
                        </a>

                        {/* Keranjang */}
                        <a href="/cart" className="flex flex-col items-center hover:text-primary/80 transition-colors duration-200">
                            <img src='/images/icons/cart.svg' alt="Keranjang" className="h-5 mb-1" />
                            <span className="text-xs lg:text-sm">Keranjang</span>
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
