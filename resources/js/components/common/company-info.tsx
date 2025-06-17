import { Card, CardContent } from "@/components/ui/card"

export default function CompanyInfo() {
    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-5 gap-8">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <h4 className="font-semibold mb-2">Bank Account</h4>
                            <div className="text-blue-600 font-bold text-lg">BCA</div>
                            <p className="text-sm text-gray-600">ASTRO WORLD INDONESIA PT</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <h4 className="font-semibold mb-2">Ownership</h4>
                            <div className="text-blue-600 font-bold">ASTRO WORLD</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <h4 className="font-semibold mb-2">Factory</h4>
                            <p className="text-sm">Jl.Raden sakti raya no 89b</p>
                            <p className="text-sm">Karang Mulya, Tangerang 15157</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <h4 className="font-semibold mb-2">Hubungi</h4>
                            <p className="text-sm">temi@astrokabinet.id</p>
                            <p className="text-sm">Whatsapp 081182133</p>
                            <p className="text-sm">IG: Astro Kabinet</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <h4 className="font-semibold mb-2">Jasa Signage</h4>
                            <div className="text-blue-600 font-bold">ORGA</div>
                            <p className="text-sm">sign.com</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
