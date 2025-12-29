import ImageWithFallback from "../ui/ImageWithFallback";

export default function HomeSection({
  headline,
  subtitle,
  ctaText,
  accentColor = "#C0392B",
}) {
  const IMG_API = (import.meta.env.VITE_IMAGES_API_BASE || "").replace(/\/$/, "");


  // Same DPI image from your bucket via your API
  const heroImg = `${IMG_API}/api/images?object=LOGO%20DPI.jpg&w=2000&q=85&format=jpeg`;

  return (
    <section
      id="home"
      className="
        relative min-h-screen flex items-center 
        bg-white dark:bg-[#121212] 
        overflow-hidden transition-colors duration-300
      "
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={heroImg}
          alt="Proyecto urbano DPI"
          className="w-full h-full object-cover"
        />

        {/* Overlay adapts in dark mode */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
            {headline}
          </h1>

          <p className="text-lg md:text-xl text-gray-200 dark:text-gray-300 mb-8 drop-shadow">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* CTA BUTTON */}
            <a
              href="#contact"
              className="
                inline-flex items-center justify-center 
                px-8 py-4 text-lg font-medium rounded-md 
                text-white shadow-lg hover:brightness-110 
                transition-all
              "
              style={{ backgroundColor: accentColor }}
            >
              {ctaText}
            </a>

            {/* OUTLINE BUTTON */}
            <a
              href="#services"
              className="
                inline-flex items-center justify-center 
                px-8 py-4 text-lg font-medium rounded-md 
                border border-white text-white 
                hover:bg-white hover:text-black 
                transition-all
              "
            >
              Conoce nuestros servicios
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Accent Bar */}
      <div
        className="
          absolute bottom-0 left-0 w-full h-2 
          transition-colors duration-300
        "
        style={{ backgroundColor: accentColor }}
      />
    </section>
  );
}
