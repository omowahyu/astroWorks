export default function ProductShowcase() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div className="relative h-64 rounded-lg overflow-hidden">
                        <img
                            src="/placeholder.svg?height=256&width=300"
                            alt="Kitchen Cabinet Design"
                                                        className="object-cover w-full h-full"
                        />
                    </div>
                    <div className="relative h-64 rounded-lg overflow-hidden">
                        <img src="/placeholder.svg?height=256&width=300" alt="TV Cabinet" className="object-cover w-full h-full" />
                    </div>
                    <div className="relative h-64 rounded-lg overflow-hidden">
                        <img src="/placeholder.svg?height=256&width=300" alt="Wardrobe Design" className="object-cover w-full h-full" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Pilih Kabinet yang kamu butuh</h3>
            </div>
        </section>
    )
}
