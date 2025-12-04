// src/components/Header.jsx
import React, { useEffect } from "react";
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
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/80 border-b border-gray-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => gotoPage("home")}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-md flex items-center justify-center text-white font-bold">
                  🎬
                </div>
                <span className="text-white font-semibold hidden sm:block">
                  CHILL
                </span>
              </button>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6 ml-4">
                {navLinks.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => gotoPage(item.page)}
                    className={`text-gray-300 hover:text-white ${
                      currentPage === item.page
                        ? "font-semibold text-white"
                        : ""
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
                  className="w-[380px] rounded-full border border-gray-700 bg-black/60 px-4 py-2 text-white placeholder:text-gray-400"
                />
                <button
                  onClick={() => setShowSearch(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"
                >
                  <Search size={16} />
                </button>
              </div>

{/* Desktop User with Dropdown */}
<div className="hidden md:block relative">
  {user ? (
    <div className="group">
      {/* Avatar */}
      <button className="w-9 h-9 bg-gray-700 rounded-full text-white flex items-center justify-center">
        {user.username ? user.username[0].toUpperCase() : "R"}
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-56 bg-[#111] border border-gray-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-4 border-b border-gray-800">
          <p className="text-white font-semibold">{user.username}</p>
          <p className="text-gray-400 text-sm">{user.phone || "No. Telepon: - "}</p>
          <p className="text-gray-400 text-sm">
            Jenis Akun: {user.premium ? "Premium ⭐" : "Free"}
          </p>
        </div>

        <button
          onClick={gotoProfile}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 text-left text-gray-200"
        >
          👤 Profil Saya
        </button>

        <button
          onClick={() => setShowPremiumModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 text-left text-gray-200"
        >
          ⭐ Upgrade Premium
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/40 text-left text-red-400 font-semibold"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  ) : (
    <button
      onClick={() => gotoPage("login")}
      className="hidden md:flex px-5 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
    >
      Masuk
    </button>
  )}
</div>

              {/* Mobile Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="md:hidden p-2 text-gray-300"
              >
                <Search size={20} />
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 text-gray-300"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[320px] bg-black text-white z-50 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold">
              🎬
            </div>
            <span className="text-lg font-semibold">CHILL</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2">
            <X size={22} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="px-4 py-4 overflow-y-auto">
          <nav className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <button
                key={item.page}
                onClick={() => gotoPage(item.page)}
                className="py-3 px-3 rounded-md hover:bg-gray-900 text-left"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="mt-6">
            <h4 className="text-gray-400 text-sm mb-2">Akun</h4>

            {user ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {user.username}
                    </div>
                    <div className="text-gray-400 text-xs">Lihat profil</div>
                  </div>
                </div>

                <button
                  onClick={gotoProfile}
                  className="w-full text-left py-2 px-2 hover:bg-gray-900 rounded-md"
                >
                  Profil Saya
                </button>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setShowPremiumModal(true);
                  }}
                  className="w-full text-left py-2 px-2 hover:bg-gray-900 rounded-md"
                >
                  Upgrade ke Premium
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full mt-4 py-3 bg-gray-800 rounded-md"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => gotoPage("login")}
                  className="w-full py-3 bg-gray-800 rounded-md mt-3"
                >
                  Masuk
                </button>
              </>
            )}
          </div>

          {/* Help */}
          <div className="mt-6">
            <h4 className="text-gray-400 text-sm mb-2">Bantuan</h4>
            <button
              onClick={() => gotoPage("help")}
              className="w-full text-left py-2 hover:bg-gray-900 rounded-md px-2"
            >
              Pusat Bantuan
            </button>
            <button
              onClick={() => gotoPage("contact")}
              className="w-full text-left py-2 hover:bg-gray-900 rounded-md px-2"
            >
              Kontak
            </button>
          </div>
        </div>
      </aside>
    </header>
  );
}
