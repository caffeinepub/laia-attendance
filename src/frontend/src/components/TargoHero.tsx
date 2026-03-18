import { Phone } from "lucide-react";
import type React from "react";

interface ClippedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "red" | "white";
  className?: string;
}

const ClippedButton = ({
  children,
  variant = "red",
  className = "",
  ...props
}: ClippedButtonProps) => {
  const isRed = variant === "red";
  const bgColor = isRed ? "bg-[#EE3F2C]" : "bg-white";
  const textColor = isRed ? "text-white" : "text-black";
  const hoverColor = isRed ? "hover:bg-red-600" : "hover:bg-gray-200";

  return (
    <button
      className={`${bgColor} ${textColor} ${hoverColor} px-6 py-3 font-medium transition-colors duration-300 ${className}`}
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
      {...props}
    >
      {children}
    </button>
  );
};

interface TargoHeroProps {
  onGetStarted?: () => void;
}

export default function TargoHero({ onGetStarted }: TargoHeroProps) {
  return (
    <section
      className="relative w-full h-screen min-h-[650px] overflow-hidden text-white bg-black selection:bg-[#EE3F2C] selection:text-white"
      style={{ fontFamily: "'Rubik', sans-serif" }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 object-cover w-full h-full"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260227_042027_c4b2f2ea-1c7c-4d6e-9e3d-81a78063703f.mp4"
      />

      <div className="relative z-10 flex flex-col w-full h-full p-8 md:p-16">
        {/* Navigation */}
        <header className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Targo logo"
            >
              <title>Targo logo</title>
              <path d="M20 0L40 20L20 40L0 20L20 0Z" fill="#EE3F2C" />
              <rect x="16" y="16" width="8" height="8" fill="white" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-white lowercase">
              targo
            </span>
          </div>

          <nav className="hidden space-x-8 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-white transition-colors hover:text-[#EE3F2C]"
              data-ocid="nav.home.link"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-white transition-colors hover:text-[#EE3F2C]"
              data-ocid="nav.about.link"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-white transition-colors hover:text-[#EE3F2C]"
              data-ocid="nav.contact.link"
            >
              Contact Us
            </a>
          </nav>

          <ClippedButton
            variant="red"
            className="hidden px-5 py-2 text-sm md:block"
            data-ocid="nav.contact.button"
            onClick={onGetStarted}
          >
            Contact Us
          </ClippedButton>
        </header>

        {/* Hero Content */}
        <div className="flex-grow mt-16 md:mt-24 lg:mt-32">
          <div className="max-w-2xl">
            <h1 className="text-[42px] md:text-[64px] font-bold uppercase leading-[1.1] tracking-[-0.04em] mb-6 drop-shadow-md">
              Swift and Simple Transport
            </h1>
            <ClippedButton
              variant="red"
              className="text-lg"
              data-ocid="hero.primary_button"
              onClick={onGetStarted}
            >
              Get Started
            </ClippedButton>
          </div>
        </div>

        {/* Consultation Card */}
        <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16">
          <div
            className="relative overflow-hidden rounded-lg p-6 max-w-[320px]"
            style={{
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow:
                "inset 0 0 15px rgba(255, 255, 255, 0.05), 0 10px 40px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.05) 55%, rgba(255,255,255,0) 100%)",
                opacity: 0.8,
              }}
            />

            <div className="relative z-10 flex flex-col space-y-4">
              <h3 className="text-sm font-bold tracking-widest text-white uppercase opacity-90">
                Book a Free Consultation
              </h3>
              <p className="text-sm text-gray-200 leading-relaxed">
                Connect with our logistics experts to map out your next
                high-priority delivery route.
              </p>

              <ClippedButton
                variant="white"
                className="flex items-center justify-center w-full space-x-2 text-sm"
                data-ocid="hero.book_call.button"
                onClick={onGetStarted}
              >
                <Phone className="w-4 h-4" />
                <span>Book a Call</span>
              </ClippedButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
