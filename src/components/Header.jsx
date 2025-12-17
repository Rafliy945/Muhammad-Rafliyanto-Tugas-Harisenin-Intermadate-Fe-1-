
import React, { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";

export default function Header({
  currentPage,
  setCurrentPage,
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  user,
  setUser,
  setShowPremiumModal,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // add scroll listener to add subtle backdrop blur / opacity when user scrolls
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setScrolled(y > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", page: "home" },
    { label: "Series", page: "series" },
    { label: "Film", page: "film" },
    { label: "Daftar Saya", page: "mylist" },
  ];

  const gotoPage = (page) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setMobileOpen(false);
    setCurrentPage("home");
  };

  const gotoProfile = () => {
    setCurrentPage("profile");
    setMobileOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-sm bg-black/60 shadow-sm' : 'bg-black/80'}`}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">

          {/* BAGIAN KIRI: LOGO & NAV */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => gotoPage("home")}
              className="flex items-center gap-2 lg:gap-3"
            >
           <img src="/icons/logo-chill.png" alt="Logo Chill" className="w-8 h-8" />
              <span className="text-white font-bold text-2xl lg:text-3xl tracking-wide">
                CHILL
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 ml-6">
              {navLinks.map((item) => (
                <button
                  key={item.page}
                  onClick={() => gotoPage(item.page)}
                  className={`text-gray-300 hover:text-white transition-colors px-2 text-sm lg:text-base ${
                    currentPage === item.page ? "font-semibold text-white" : ""
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Search + Profile */}
          <div className="flex items-center gap-3">

            {/* Desktop Search */}
            <div className="hidden md:flex relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari film, series, atau genre..."
                className="w-[300px] lg:w-[440px] rounded-full border border-gray-700 bg-black/60 px-4 py-2 text-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
              />
              <button
                onClick={() => setShowSearch(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                aria-label="Open search"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Desktop User Dropdown */}
            <div className="hidden md:block relative">
              {user ? (
                <div className="group relative py-2"> {/* Tambah padding wrapper agar hover tidak putus */}
                  <button className="w-9 h-9 bg-gray-700 rounded-full text-white flex items-center justify-center overflow-hidden border border-transparent group-hover:border-white transition-all">
                    {user.avatar ? (
                      <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      user.username ? user.username[0].toUpperCase() : "R"
                    )}
                  </button>

                  <div className="absolute right-0 top-full mt-0 w-56 bg-[#181818] border border-gray-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 bg-[#222]">
                      <p className="text-white font-semibold truncate">{user.username}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {user.premium ? "⭐ Premium Member" : "Standard Member"}
                      </p>
                    </div>

                    <button
                      onClick={gotoProfile}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-left text-gray-200 text-sm transition-colors"
                    >
                      👤 Profil Saya
                    </button>

                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 text-left text-gray-200 text-sm transition-colors"
                    >
                      ⭐ Ubah Premium
                    </button>

                    <div className="border-t border-gray-700 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/30 text-left text-red-400 font-semibold text-sm transition-colors"
                    >
                      🚪 Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => gotoPage("login")}
                  className="hidden md:flex px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors text-sm"
                >
                  Masuk
                </button>
              )}
            </div>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowSearch(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
              aria-label="Open mobile search"
            >
              <Search size={22} />
            </button>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
              aria-label="Open mobile menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] bg-[#121212] text-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
          
          {/* --- UPDATE: LOGO DRAWER MOBILE */}
          <div className="flex items-center gap-2">
            <img src="/icons/logo-chill.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-white font-bold text-2xl tracking-wide">
              CHILL
            </span>
          </div>
        

          <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="px-4 py-6 overflow-y-auto h-[calc(100%-80px)]">
          <nav className="flex flex-col gap-1 mb-8">
            {navLinks.map((item) => (
              <button
                key={item.page}
                onClick={() => gotoPage(item.page)}
                className={`py-3 px-4 rounded-lg text-left transition-colors font-medium ${
                    currentPage === item.page ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="pt-6 border-t border-gray-800">
            <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 px-2">Akun</h4>

            {user ? (
              <>
                <div className="flex items-center gap-3 mb-6 px-2">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold">
                     {user.username ? user.username[0].toUpperCase() : "U"}
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-semibold text-sm truncate">{user.username}</div>
                    <div className="text-gray-400 text-xs">
                        {user.premium ? "Premium Member" : "Free Plan"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={gotoProfile}
                  className="w-full text-left py-2.5 px-3 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white mb-1"
                >
                  Profil Saya
                </button>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowPremiumModal(true);
                  }}
                  className="w-full text-left py-2.5 px-3 hover:bg-gray-800 rounded-lg text-sm text-gray-300 hover:text-white mb-1"
                >
                  Upgrade Premium
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2.5 px-3 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium mt-2"
                >
                  Keluar
                </button>
              </>
            ) : (
              <button
                onClick={() => gotoPage("login")}
                className="w-full py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      </aside>
    </header>
  );
}
