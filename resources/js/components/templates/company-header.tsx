export default function CompanyHeader() {
    return (
        <header className="bg-blue-500 text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold">
                            ASTRO
                            <br />
                            <span className="text-lg font-normal">kabinet</span>
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <p className="font-semibold">Kustom Furniture Premium Untuk Rumah & Bisnis</p>
                        <p>Kitchen Set | Wardrobe | Kabinet TV | Kabinets Meja Office</p>
                        <p>Booth Pameran | Huruf Timbul | Neonbox</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
