
export default function QualitySection() {
    return (
        <section className="pt-12 pb-4">
            <div className="container mx-auto">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 text-black p-2 lg:p-12 flex flex-col items-center justify-start">
                        <h3 className="text-xl lg:text-4xl text-center font-bold mb-4">Jaminan termurah</h3>
                        <p className="text-center text-sm lg:text-lg mb-6">
                            Untuk kabinet konsep mewah ala italy dengan gola & led shelving kami termurah, ataupun konsep japan dan
                            skandinavia
                        </p>
                        <div className="flex justify-center items-center mt-12 h-full overflow-x-auto">
                            <img src="/images/statics/company/JaminanTermurah.svg" alt="freeDesign&Cepat" className="object-cover w-full h-26 lg:h-56" />
                        </div>
                    </div>
                    <div className=" bg-linear-to-br from-[#D3EAF7] to-[#F8F8F8] text-black p-2 lg:p-12 flex flex-col items-center justify-start ">
                        <h3 className="text-xl lg:text-4xl text-center font-bold mb-4">Jaminan Kualitas Produksi</h3>
                        <p className="text-center text-sm lg:text-lg mb-6">
                            Semua produk di produksi mesin standar internasional dan dilalui quality control untuk menjamin kerapihan
                        </p>
                        <div className="flex justify-center mt-12">
                            <img src="/images/statics/company/JaminanKualitasProduksi.png" alt="Jaminan Kualitas Produksi AstroKabinet" className="object-cover w-full h-full" />
                        </div>
                    </div>

                    <div className="bg-gray-100 text-black p-2 lg:p-12 flex flex-col items-center justify-start">
                        <h3 className="text-xl lg:text-4xl text-center font-bold mb-4">Dynamic Spaces</h3>
                        <p className="text-center text-sm lg:text-lg mb-6">
                            Astro Kabinet memiliki sertifikasi untuk pembuatan Kitchen system Dynamic Space. Storage dan dinamika
                            belajar di dapur lebih dinamis dan nyaman.
                        </p>
                        <div className="flex justify-center items-center mt-12 h-full">
                            <img src="/images/statics/company/DynamicSpace.png" alt="Dynamic Space" className="object-cover w-full h-56" />
                        </div>
                    </div>

                    <div className="bg-gray-100 text-black p-2 lg:p-12 flex flex-col items-center justify-start">
                        <h3 className="text-xl lg:text-4xl text-center  font-bold mb-4">Aksesoris internasional</h3>
                        <p className="text-center text-sm lg:text-lg mb-6">
                            Astro Kabinet memiliki konstruksi sesuai standar konstruksi internasional dan tidak memakai paku, dapat
                            melakukan upgrade aksesoris.
                        </p>
                        <div className="flex justify-center items-center mt-12 h-full">
                            <img src="/images/statics/company/AksesInternasional.png" alt="Aksesoris Internasional" className="object-cover w-full h-56" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
