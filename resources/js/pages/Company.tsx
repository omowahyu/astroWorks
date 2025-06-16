import Header from "@/components/templates/company-header"
import VideoSection from "@/components/video-section"
import WelcomeSection from "@/components/welcome-section"
import ProductShowcase from "@/components/product-showcase"
import FeaturesSection from "@/components/features-section"
import CompanyInfo from "@/components/company-info"
import QualitySection from "@/components/quality-section"
import DynamicSpaceSection from "@/components/dynamic-space-section"
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
