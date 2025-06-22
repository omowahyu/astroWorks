import React from 'react';

export default function CompanyHeader() {
    return (
        <header className="bg-blue-500 text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold">
                        <a href="/" className="flex items-center py-2 pr-5 border-r-2">
                            <img src='/images/logo/astrokabinet.svg' alt="Astro Works Logo" className="h-10 md:14" />
                        </a>
                    </div>
                    <div className="text-left text-[10px]">
                        <p className="font-semibold">Kustom Furniture Premium Untuk Rumah & Bisnis</p>
                        <p>Kitchen Set | Wardrobe | Kabinet TV | Kabinets Meja Office</p>
                        <p>Booth Pameran | Huruf Timbul | Neonbox</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
