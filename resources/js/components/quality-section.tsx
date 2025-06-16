import { Award } from "lucide-react"

export default function QualitySection() {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Jaminan termurah</h3>
                        <p className="text-gray-600 mb-6">
                            Untuk kabinet konsep mewah ala italy dengan gola & led shelving kami termurah, ataupun konsep japan dan
                            skandinavia
                        </p>
                        <div className="flex justify-center">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                <Award className="w-12 h-12 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Jaminan Kualitas Produksi</h3>
                        <p className="text-gray-600 mb-6">
                            Semua produk di produksi mesin standar internasional dan diuji quality control untuk menjamin kerapihan.
                        </p>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                <div key={item} className="relative h-16 bg-gray-200 rounded">
                                    <img
                                        src={`/placeholder.svg?height=64&width=64`}
                                        alt={`Quality Control ${item}`}
                                        loading="lazy"
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
