export default function VideoSection() {
    return (
        <section className="bg-gray-50">
            <div className="mx-auto pb-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                        <div className=" mb-4">
                            <img
                                src="/images/statics/company/imwBxBc%231%202.png"
                                alt="Modern Kitchen Interior"

                                className="object-cover w-full h-full"
                            />
                        </div>
                        <h3 className="text-4xl font-semibold">Ads Video</h3>
                    </div>
                    <div className="text-center">
                        <div className=" mb-4">
                            <img src="/images/statics/company/imwBxBc%231%203.png" alt="Product Showcase"  className="object-cover w-full h-full" />
                        </div>
                        <h3 className="text-4xl font-semibold">Product Video</h3>
                    </div>
                </div>
            </div>
        </section>
    )
}
