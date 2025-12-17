import React, { useState } from "react";

const PremiumSubscription = ({ user, setUser, setShowPremiumModal, isModal, closeModal, setCurrentPage, setSelectedGenre }) => {
  const [selectedPlan, setSelectedPlan] = useState("berdua");

  const handleUpgrade = () => {
    alert("Selamat! Anda sekarang pengguna Premium 🎉");
  };

  // --- FUNGSI INTERAKTIF FOOTER ---
  const handleGenreClick = (genre) => {
    // Set genre yang dipilih
    if (setSelectedGenre) setSelectedGenre(genre);
    
    // Pindah ke halaman 'film' agar user bisa melihat hasil filter
    if (setCurrentPage) setCurrentPage('film'); 
    
    // Scroll ke atas halaman
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHelpClick = (pageName) => {
    alert(`Maaf, halaman "${pageName}" belum tersedia saat ini.`);
  };

  // Komponen tombol kecil untuk footer
  const FooterGenreButton = ({ name }) => (
    <button 
      onClick={() => handleGenreClick(name)}
      className="text-gray-300 hover:text-white transition-colors text-left text-sm"
    >
      {name}
    </button>
  );

  const FooterHelpButton = ({ name }) => (
    <button 
      onClick={() => handleHelpClick(name)}
      className="text-sm text-gray-300 hover:text-white transition-colors text-left"
    >
      {name}
    </button>
  );
 

  const benefits = [
    { icon: "download", title: "Download Konten Pilihan" },
    { icon: "noads", title: "Tidak Ada Iklan" },
    { icon: "allcontent", title: "Tonton Semua Konten" },
    { icon: "4k", title: "Kualitas Maksimal Sampai Dengan 4K" },
    { icon: "devices", title: "Tonton di Tv, Tablet, Mobile, dan Laptop" },
    { icon: "subtitle", title: "Subtitle Untuk Konten Pilihan" }
  ];

  const plans = [
    {
      id: "individual",
      name: "Individual",
      price: "Rp49.990/bulan",
      duration: "1 Akun",
      features: ["Tidak ada iklan", "Kualitas 720p", "Download konten pilihan"]
    },
    {
      id: "berdua",
      name: "Berdua",
      price: "Rp79.990/bulan",
      duration: "2 Akun",
      features: ["Tidak ada iklan", "Kualitas 1080p", "Download konten pilihan"],
      popular: true
    },
    {
      id: "keluarga",
      name: "Keluarga",
      price: "Rp159.990/bulan",
      duration: "5-7 Akun",
      features: ["Tidak ada iklan", "Kualitas 4K", "Download konten pilihan"]
    }
  ];

  /* ICON DARI PUBLIC */
  const renderIcon = (type) => {
    const icons = {
      download: "/icons/download.png",
      noads: "/icons/noads.png",
      allcontent: "/icons/allcontent.png",
      "4k": "/icons/4k.png",
      devices: "/icons/devices.png",
      subtitle: "/icons/subtitle.png"
    };

    return (
      <img
        src={icons[type]}
        alt={type}
        className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
        draggable={false}
      />
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#0F0F0F] text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-16 sm:mb-20">Kenapa Harus Berlangganan?</h1>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 sm:gap-x-16 gap-y-12 sm:gap-y-16 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="mb-6 flex items-center justify-center h-16 sm:h-20">
                  {renderIcon(benefit.icon)}
                </div>
                <p className="text-base sm:text-lg text-gray-200 leading-snug px-2">
                  {benefit.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mx-4 sm:mx-6"></div>

      {/* Pricing Section */}
      <div className="px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">Pilih Paketmu</h2>
          <p className="text-gray-400 mb-12 sm:mb-14 text-base sm:text-lg">
            Temukan paket sesuai kebutuhanmu!
          </p>

          {/* Pricing Cards */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-6 max-w-sm sm:max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`w-full sm:w-80 bg-gradient-to-b from-[#5C6BC0] to-[#3949AB] rounded-xl p-6 relative cursor-pointer transition-all ${selectedPlan === plan.id ? 'ring-2 ring-white' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold px-4 py-1 rounded-full shadow-lg">
                      POPULAR
                    </div>
                  </div>
                )}

                <div className="inline-block bg-[#37474F] text-white px-5 py-1.5 rounded-full text-sm font-medium mb-6">
                  {plan.name}
                </div>

                <div className="mb-5">
                  <p className="text-white text-sm mb-1">
                    Mulai dari <span className="font-semibold">{plan.price}</span>
                  </p>
                  <p className="text-white text-sm">{plan.duration}</p>
                </div>

                <div className="border-t border-white/30 my-5"></div>

                <div className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-white">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id);
                    handleUpgrade();
                  }}
                  className="w-full py-3 rounded-full font-semibold text-sm bg-white text-[#5C6BC0] hover:bg-gray-100 transition-colors shadow-md"
                >
                  Langganan
                </button>

                <p className="text-white/80 text-xs mt-3 text-center">
                  Syarat dan Ketentuan Berlaku
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-gray-800 pt-16 pb-12 px-6 md:px-12 mt-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Mobile View - Accordion Style */}
          <div className="lg:hidden">
            {/* Logo & Copyright  */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <img src="/public/icons/logo-chill.png" alt="Logo Chill" className="w-8 h-8" />
                <h3 className="text-white font-bold text-2xl">
                  CHILL
                </h3>
              </div>
              <p className="text-sm text-gray-400">
                @2023 Chill All Rights Reserved.
              </p>
            </div>

            {/* Genre Accordion (INTERAKTIF) */}
            <details className="border-b border-gray-800 py-4">
              <summary className="flex items-center justify-between cursor-pointer text-white text-lg font-semibold">
                Genre
                <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                {['Aksi', 'Drama', 'Komedi', 'Sains & Alam', 'Anak-anak', 'Fantasi Ilmiah & Fantasi', 'Petualangan', 'Thriller', 'Anime', 'Kejahatan', 'Perang', 'Britania', 'KDrama', 'Romantis'].map(genre => (
                   <FooterGenreButton key={genre} name={genre} />
                ))}
              </div>
            </details>

            {/* Bantuan Accordion (INTERAKTIF) */}
            <details className="border-b border-gray-800 py-4">
              <summary className="flex items-center justify-between cursor-pointer text-white text-lg font-semibold">
                Bantuan
                <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </summary>
              <div className="mt-4 flex flex-col gap-3">
                {['FAQ', 'Kontak Kami', 'Privasi', 'Syarat & Ketentuan'].map(item => (
                  <FooterHelpButton key={item} name={item} />
                ))}
              </div>
            </details>
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden lg:flex justify-between items-start">
            {/* LEFT: Logo & Copyright  */}
            <div className="mb-8 max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <img src="/public/icons/logo-chill.png" alt="Logo Chill" className="w-10 h-auto" />
                <h3 className="text-white font-bold text-3xl tracking-wide">
                  CHILL
                </h3>
              </div>
              <p className="text-sm text-gray-400">@2023 Chill All Rights Reserved.</p>
            </div>

            {/* Right Side - Genre & Bantuan (INTERAKTIF) */}
            <div className="flex gap-16 xl:gap-24">
              {/* Genre Section */}
              <div>
                <h4 className="text-white text-lg font-bold mb-6">Genre</h4>
                <div className="grid grid-cols-4 gap-x-8 gap-y-4 text-sm">
                  {/* Col 1 */}
                  <div className="flex flex-col gap-4">
                      <FooterGenreButton name="Aksi" />
                      <FooterGenreButton name="Anak-anak" />
                      <FooterGenreButton name="Anime" />
                      <FooterGenreButton name="Britania" />
                  </div>
                  {/* Col 2 */}
                  <div className="flex flex-col gap-4">
                      <FooterGenreButton name="Drama" />
                      <FooterGenreButton name="Fantasi Ilmiah & Fantasi" />
                      <FooterGenreButton name="Kejahatan" />
                      <FooterGenreButton name="KDrama" />
                  </div>
                  {/* Col 3 */}
                  <div className="flex flex-col gap-4">
                      <FooterGenreButton name="Komedi" />
                      <FooterGenreButton name="Petualangan" />
                      <FooterGenreButton name="Perang" />
                      <FooterGenreButton name="Romantis" />
                  </div>
                    {/* Col 4 */}
                    <div className="flex flex-col gap-4">
                      <FooterGenreButton name="Sains & Alam" />
                      <FooterGenreButton name="Thriller" />
                  </div>
                </div>
              </div>

              {/* Bantuan Section */}
              <div>
                <h4 className="text-white text-lg font-bold mb-6">Bantuan</h4>
                <div className="flex flex-col gap-4 text-sm">
                  <FooterHelpButton name="FAQ" />
                  <FooterHelpButton name="Kontak Kami" />
                  <FooterHelpButton name="Privasi" />
                  <FooterHelpButton name="Syarat & Ketentuan" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default PremiumSubscription;
