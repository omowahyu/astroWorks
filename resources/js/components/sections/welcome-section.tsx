import { Button } from "@/components/ui/button"

export default function WelcomeSection() {
    const btnSolid  ="bg-blue-500 hover:bg-blue-600 border-blue-500 text-white rounded-full"
    const btnOutline = 'bg-transparent hover:bg-blue-500 text-blue-500 hover:text-white border-blue-400 hover:border-blue-500 rounded-full'
    return (
        <section className="py-12 bg-linear-to-br from-[#D3EAF7] to-[#F8F8F8]">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl leading-snug lg:text-5xl font-bold mb-4 text-black">
                    Selamat datang di toko kustom kabinet One Stop Solution
                </h2>
                <p className="text-black leading-snug font-medium mb-8 text-xl mx-auto">
                    Memberikan solusi Kebutuhan untuk rumah konsep mewah harga standard, Kebutuhan untuk bisnis yang butuh cepat
                    harga terjangkau.
                </p>
                <div className="flex flex-wrap justify-center gap-2 lg:gap-4">
                    <Button className={`text-sm lg:text-lg py-5 px-4 lg:py-6 lg:px-8 ${btnSolid}`}>Katalog</Button>
                    <Button variant="outline" className={`text-sm lg:text-lg py-5 px-4 lg:py-6 lg:px-8 ${btnOutline} `}>Wardrobe</Button>
                    <Button variant="outline" className={`text-sm lg:text-lg py-5 px-4 lg:py-6 lg:px-8 ${btnOutline} `}>TV Cabinet</Button>
                    <Button variant="outline" className={`text-sm lg:text-lg py-5 px-4 lg:py-6 lg:px-8 ${btnOutline} `}>Shop Display</Button>
                </div>
            </div>
            <div className="container mx-auto mt-16">
                <img src="images/statics/company/Welcome.png" className="h-full w-full object-cover" alt="" />
            </div>
        </section>
    )
}
