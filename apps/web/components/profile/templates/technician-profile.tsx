import { PublicProfileHero } from '../public-profile-hero';
import { PublicProfileAbout } from '../public-profile-about';
import { PublicPortfolioGrid } from '../public-portfolio-grid';
import { PublicServiceMenu } from '../public-service-menu';
import { PublicFaqAccordion } from '../public-faq-accordion';

export function TechnicianProfileTemplate({ profile, portfolioItems }: { profile: any, portfolioItems: any[] }) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Technician Hero Section */}
      <PublicProfileHero profile={profile} />

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (About & Certificates) */}
        <div className="lg:col-span-5 space-y-8">
          <PublicProfileAbout profile={profile} />
          <PublicFaqAccordion faqs={profile.faqs} />
        </div>

        {/* Right Column (Portfolio & Services) */}
        <div className="lg:col-span-7 space-y-8">
          <PublicServiceMenu services={profile.services} />
          <PublicPortfolioGrid portfolioItems={portfolioItems} />
        </div>
      </div>
    </div>
  );
}
