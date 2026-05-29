import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Research from '@/components/Research';
import Publications from '@/components/Publications';
import Experience from '@/components/Experience';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ReadingProgress from '@/components/ReadingProgress';

export default function Home() {
  return (
    <>
      <ReadingProgress />
      <Navigation />
      <main>
        <Hero />
        <About />
        <Research />
        <Publications />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
