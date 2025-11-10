import Navbar from "./components/Navbar";
import HomeHero from "./components/HomeHero";



export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HomeHero />
      </main>
      
    </div>
  );
}
