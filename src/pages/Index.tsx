import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import CategorySection from "@/components/CategorySection";
import TrendingSection from "@/components/TrendingSection";
import CollectionBanner from "@/components/CollectionBanner";
import SustainabilitySection from "@/components/SustainabilitySection";
import CommunitySection from "@/components/CommunitySection";
import TrustSection from "@/components/TrustSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <MarqueeBanner />
        <CategorySection />
        <TrendingSection />
        <CollectionBanner />
        <SustainabilitySection />
        <CommunitySection />
        <TrustSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
