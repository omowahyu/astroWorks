export default function VideoSection() {
    return (
        <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center">
                        <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                            <img
                                src="/placeholder.svg?height=256&width=400"
                                alt="Modern Kitchen Interior"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <h3 className="text-xl font-semibold">Ads Video</h3>
                    </div>
                    <div className="text-center">
                        <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                            <img src="/placeholder.svg?height=256&width=400" alt="Product Showcase" className="object-cover w-full h-full" />
                        </div>
                        <h3 className="text-xl font-semibold">Product Video</h3>
                    </div>
                </div>
            </div>
        </section>
    )
}
