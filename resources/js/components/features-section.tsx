import { Award } from "lucide-react"

export default function FeaturesSection() {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">Free Design & Cepat</h3>
                        <p className="text-gray-600 mb-6">
                            Setelah ada foto dan ukuran ruangan, kami membantu design layout dan survei gratis, dan bisa langsung
                            produksi.
                        </p>
                        <div className="relative h-48 rounded-lg overflow-hidden">
                            <img src="/placeholder.svg?height=192&width=300" alt="Interior Design" loading="lazy" className="w-full object-cover" />
                        </div>
                    </div>
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
                </div>
            </div>
        </section>
    )
}
