import React, { useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'motion/react';

export default function CompanyInfo() {
    // 1. Kita butuh dua ref: satu untuk kontainer, satu untuk elemen yang digeser
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
        <section className="container mx-auto">

            <motion.div
                ref={containerRef}
                className="relative h-72 w-full overflow-hidden  bg-gray-200 cursor-grab"
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
                        src="/images/statics/company/Group.png"
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
        </section>
    )
}
