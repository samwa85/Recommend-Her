import Hero from '../sections/Hero';
import ValueProposition from '../sections/ValueProposition';
import HowItWorks from '../sections/HowItWorks';
import ForTalentSection from '../sections/ForTalentSection';
import ForSponsorsSection from '../sections/ForSponsorsSection';
import TalentPoolPreview from '../sections/TalentPoolPreview';
import Testimonials from '../sections/Testimonials';
import CTASection from '../sections/CTASection';

const HomePage = () => {
  return (
    <>
      <Hero />
      <ValueProposition />
      <HowItWorks />
      <ForTalentSection />
      <ForSponsorsSection />
      <TalentPoolPreview />
      <Testimonials />
      <CTASection />
    </>
  );
};

export default HomePage;
