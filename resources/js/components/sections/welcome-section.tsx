import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import React, { useRef, useState, useLayoutEffect } from 'react';


export default function WelcomeSection() {
    const btnSolid  ="bg-blue-500 hover:bg-blue-600 border-blue-500 rounded-full"
    const btnOutline = 'bg-transparent hover:bg-blue-500 text-blue-500 hover:text-white border-blue-400 hover:border-blue-500 rounded-full'
    const containerRef = useRef(null);
    const draggableRef = useRef(null);

    // 2. State untuk menyimpan seberapa jauh gambar bisa digeser ke kiri
    const [dragConstraint, setDragConstraint] = useState(0);

    // 3. Gunakan useLayoutEffect untuk mengukur elemen SETELAH mereka dirender di DOM
    //    Ini mencegah "kedipan" visual yang mungkin terjadi dengan useEffect biasa.
    useLayoutEffect(() => {
        // Pastikan kedua elemen sudah ada
        if (containerRef.current && draggableRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const draggableWidth = draggableRef.current.offsetWidth;

            // Hitung perbedaan lebar. Ini adalah jarak maksimal untuk digeser.
            const constraint = draggableWidth - containerWidth;

            // Simpan nilai constraint (jika gambar lebih lebar dari kontainer)
            setDragConstraint(constraint > 0 ? constraint : 0);
        }
    }, []); // Array dependensi kosong agar hanya berjalan sekali saat komponen dimuat

    return (
        <section className="py-12 bg-linear-to-br from-[#D3EAF7] to-[#F8F8F8]">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 text-black">
                    Selamat datang di toko kustom kabinet One Stop Solution
                </h2>
                <p className="text-black md:font-medium mb-8 text-sm lg:text-xl mx-auto">
                    Memberikan solusi Kebutuhan untuk rumah konsep mewah harga standard, Kebutuhan untuk bisnis yang butuh cepat
                    harga terjangkau.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    <Button className={`text-xs lg:text-lg py-1 px-3 lg:py-6 lg:px-8 ${btnSolid}`}>Katalog</Button>
                    <Button variant="outline" className={`text-xs lg:text-lg py-1 px-3 lg:py-6 lg:px-8 ${btnOutline} `}>Wardrobe</Button>
                    <Button variant="outline" className={`text-xs lg:text-lg py-1 px-3 lg:py-6 lg:px-8 ${btnOutline} `}>TV Cabinet</Button>
                    <Button variant="outline" className={`text-xs lg:text-lg py-1 px-3 lg:py-6 lg:px-8 ${btnOutline} `}>Shop Display</Button>
                </div>
            </div>
            <div className="container mx-auto mt-16">
                <motion.div
                    ref={containerRef}
                    className="relative h-72 w-full overflow-hidden rounded-lg bg-gray-200 cursor-grab"
                    whileTap={{ cursor: 'grabbing' }}
                >
                    {/* Elemen yang akan digeser. Gunakan inline-flex agar lebarnya pas dengan gambar di dalamnya. */}
                    <motion.div
                        ref={draggableRef}
                        className="inline-flex"
                        drag="x"
                        // 4. Terapkan batas geser yang sudah dihitung secara dinamis
                        // right: 0      -> Tidak bisa digeser ke kanan melebihi posisi awal
                        // left: -dragConstraint -> Bisa digeser ke kiri sejauh perbedaan lebarnya
                        dragConstraints={{ right: 0, left: -dragConstraint }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* KUNCI PADA GAMBAR:
                      - h-72: Samakan tingginya dengan kontainer.
                      - w-auto: Biarkan browser menghitung lebarnya secara otomatis sesuai rasio aspek.
                      - max-w-none: SANGAT PENTING! Ini mengizinkan gambar menjadi lebih lebar dari parent-nya.
                    */}
                        <img
                            src="/images/statics/company/Welcome.png"
                            className="pointer-events-none h-72 w-auto max-w-none object-cover"
                            alt="Welcome"
                            // Tambahkan onLoad untuk trigger re-calculation jika gambar lambat dimuat (opsional tapi bagus)
                            onLoad={() => {
                                if (containerRef.current && draggableRef.current) {
                                    const containerWidth = containerRef.current.offsetWidth;
                                    const draggableWidth = draggableRef.current.offsetWidth;
                                    const constraint = draggableWidth - containerWidth;
                                    setDragConstraint(constraint > 0 ? constraint : 0);
                                }
                            }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
