import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Card Number Scanner - OCR WebAssembly",
  description:
    "Secure browser-based card number scanner using WebAssembly and OCR technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="fixed bottom-5 right-5 bg-white/10 backdrop-blur-lg rounded-3xl p-6 text-white z-10 border border-white/20 shadow-2xl max-w-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl hover:bg-white/15">
          <div className="flex flex-col gap-4">
            <div className="developer-info">
              <h3 className="text-lg font-semibold mb-2 text-white">
                👨‍💻 Developer
              </h3>
              <p className="text-xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Fariborz
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://fariborzz.ir"
                  target="_blank"
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-xl text-white text-sm transition-all duration-300 hover:bg-white/20 hover:translate-x-1 hover:shadow-lg border border-white/10"
                >
                  <span className="text-base opacity-80">🌐</span>
                  <span className="font-medium">Website</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/fariborzamm"
                  target="_blank"
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-xl text-white text-sm transition-all duration-300 hover:bg-white/20 hover:translate-x-1 hover:shadow-lg border border-white/10"
                >
                  <span className="text-base opacity-80     p-1 rounded-lg">
                    💼
                  </span>
                  <span className="font-medium">LinkedIn</span>
                </a>
                <a
                  href="https://github.com/fariborz0015"
                  target="_blank"
                  className="flex items-center gap-3 p-3 bg-white/10 rounded-xl text-white text-sm transition-all duration-300 hover:bg-white/20 hover:translate-x-1 hover:shadow-lg border border-white/10"
                >
                  <span className="text-base opacity-80">🔗</span>
                  <span className="font-medium">GitHub</span>
                </a>
              </div>
            </div>
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-xs opacity-80 mb-1 leading-relaxed">
                Built with ❤️ for better user experience
              </p>
              <p className="text-xs font-medium">
                ⭐ Star this repository if you found it helpful!
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
