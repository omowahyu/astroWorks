import { Award } from 'lucide-react';

export default function ProductShowcase() {
    return (
        <section className="pt-12 pb-4">
            <div className="container mx-auto">
                <h3 className="text-4xl font-bold text-gray-800 pb-6">Pilih Kabinet yang kamu butuh</h3>
                <div className="grid grid-cols-2 gap-2 gap-y-8">
                    <div className="bg-gray-200 text-black p-12 flex flex-col items-center justify-center h-[480px]"></div>
                    <div className="bg-gray-200 text-black p-12 flex flex-col items-center justify-center h-[480px]"></div>
                    <div className="bg-gray-200 text-black p-12 flex flex-col items-center justify-start">
                        <h3 className="text-4xl font-bold mb-4">Free Design & Cepat</h3>
                        <p className="text-center text-lg mb-6">
                            Setelah ada foto dan ukuran ruangan, kami membantu design layout dan survei gratis, dan bisa langsung
                            produksi.
                        </p>
                        <div className="flex justify-center mt-12">
                            <img src="/images/statics/company/freeDesign&Cepat.png" alt="freeDesign&Cepat" className="object-cover w-full h-full" />
                        </div>
                    </div>
                    <div className="bg-gray-200 text-black p-12 flex flex-col items-center justify-start">
                        <h3 className="text-4xl font-bold mb-4">Jaminan termurah</h3>
                        <p className="text-center text-lg mb-6">
                            Untuk kabinet konsep mewah ala italy dengan gola & led shelving kami termurah, ataupun konsep japan dan
                            skandinavia
                        </p>
                        <div className="flex justify-center items-center mt-12 h-full">
                            <img src="/images/statics/company/JaminanTermurah.svg" alt="freeDesign&Cepat" className="object-cover w-full h-56" />
                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}
