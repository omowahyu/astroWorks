import { Button } from "@/components/ui/button"

export default function WelcomeSection() {
    return (
        <section className="py-12 bg-blue-50">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">
                    Selamat datang di toko kustom kabinet One Stop Solution
                </h2>
                <p className="text-gray-600 mb-8 max-w-4xl mx-auto">
                    Memberikan solusi Kebutuhan untuk rumah konsep mewah harga standard, Kebutuhan untuk bisnis yang butuh cepat
                    harga terjangkau.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button className="bg-blue-500 hover:bg-blue-600">Katalog</Button>
                    <Button variant="outline">Wardrobe</Button>
                    <Button variant="outline">TV Cabinet</Button>
                    <Button variant="outline">Shop Display</Button>
                </div>
            </div>
        </section>
    )
}
