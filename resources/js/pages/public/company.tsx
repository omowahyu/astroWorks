import Header from "@/components/templates/company-header"
import VideoSection from "@/components/sections/video-section"
import WelcomeSection from "@/components/sections/welcome-section"
import ProductShowcase from "@/components/sections/product-showcase"
import FeaturesSection from "@/components/sections/features-section"
import CompanyInfo from "@/components/common/company-info"
import QualitySection from "@/components/sections/quality-section"
import DynamicSpaceSection from "@/components/sections/dynamic-space-section"
import Footer from "@/components/templates/company-footer"

export default function Company() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <VideoSection />
            <WelcomeSection />
            <ProductShowcase />
            <FeaturesSection />
            <CompanyInfo />
            <QualitySection />
            <DynamicSpaceSection />
            <Footer />
        </div>
    )
}
