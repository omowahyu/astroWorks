
export default function DynamicSpaceSection() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Dinamic Space</h3>
                        <p className="text-gray-600 mb-6">
                            Astro Kabinet memiliki sertifikasi untuk pembuatan Kitchen system Dynamic Space. Storage dan dinamika
                            belajar di dapur lebih dinamis dan nyaman.
                        </p>
                        <div className="grid grid-cols-6 gap-4">
                            {["Plywood", "MDF Premium", "Veneer", "Polyester", "Melamine", "Carpenter"].map((cert) => (
                                <div key={cert} className="text-center">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                                    <p className="text-xs">{cert}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Aksesoris internasional</h3>
                        <p className="text-gray-600 mb-6">
                            Astro Kabinet memiliki konstruksi sesuai standar konstruksi internasional dan tidak memakai paku, dapat
                            melakukan upgrade aksesoris.
                        </p>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {["BLUM", "HAFELE", "Hettich", "IKEA"].map((brand) => (
                                <div key={brand} className="text-center p-2 border rounded">
                                    <p className="font-semibold text-sm">{brand}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div key={item} className="relative h-16 bg-gray-200 rounded">
                                    <img
                                        src={`/placeholder.svg?height=64&width=64`}
                                        alt={`Accessory ${item}`}
                                        className="object-cover rounded w-full h-full"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
