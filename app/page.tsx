import { About } from "@/components/about";
import { DownloadSection } from "@/components/download-section";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HitokotoCard } from "@/components/hitokoto-card";
import { JoinSection } from "@/components/join-section";
import { LeagueSection } from "@/components/league-section";
import { MessageBoard } from "@/components/message-board";
import { SiteNav } from "@/components/site-nav";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <HitokotoCard />
        <About />
        <DownloadSection />
        <LeagueSection />
        <MessageBoard />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}
