import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PublicIntroGate } from "@/components/home/intro-loader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicIntroGate>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PublicIntroGate>
  );
}
