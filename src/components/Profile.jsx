import React, { useState } from "react";
import { Edit2, X } from "lucide-react";
import MovieDetailModal from "./MovieDetailModal";

const Profile = ({ user, setUser, myList = [], toggleMyList, setShowPremiumModal, setCurrentPage, movies = [], setSelectedGenre }) => {
  const [editing, setEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: ""
  });
  

  const [profileImage, setProfileImage] = useState(user?.avatar || user?.profileImage || null);
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);

  // --- FUNGSI INTERAKTIF FOOTER ---
  const handleGenreClick = (genre) => {
    if (setSelectedGenre) setSelectedGenre(genre);
    setCurrentPage('film');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHelpClick = (pageName) => {
    alert(`Maaf, halaman "${pageName}" belum tersedia saat ini.`);
  };

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


  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 md:pt-28 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Kamu belum login</h2>
          <p className="text-gray-400 mb-6 text-sm md:text-base">Silakan masuk untuk mengakses profil.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <button 
              onClick={() => setCurrentPage("login")}
              className="px-4 py-2.5 md:py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm md:text-base"
            >
              Masuk
            </button>
            <button 
              onClick={() => setCurrentPage("register")}
              className="px-4 py-2.5 md:py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm md:text-base"
            >
              Daftar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setCurrentPage("home");
  };

  const handleEditClick = (field) => {
    setEditing(true);
    setEditingField(field);
    
    if (field === 'password') {
      setFormData({...formData, password: ''});
    }
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      avatar: profileImage 
    };

    if (formData.password && formData.password !== "••••••••••••••") {
      updatedUser.password = formData.password;
    }

    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setEditing(false);
    setEditingField(null);
    setFormData({...formData, password: "••••••••••••••"});
    alert("Profil berhasil diperbarui!");
  };

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      password: "••••••••••••••"
    });
    setProfileImage(user.avatar || user.profileImage || null);
    setEditing(false);
    setEditingField(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Batasan ukuran 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file maksimal 10MB");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  };

  const closeMovieModal = () => {
    setShowMovieModal(false);
    setSelectedMovie(null);
  };

  const openMovieModal = (movie) => {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  };

  const isInMyList = (movieId) => {
    return myList.some(item => item.id === movieId);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-16 md:pt-20 px-3 sm:px-4 pb-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-7xl mx-auto pb-20">
        
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 px-2 sm:px-4">Profil Saya</h1>

        {/* Premium Card - Mobile First Position */}
        <div className="block lg:hidden mb-6 md:mb-8 px-2 sm:px-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="text-2xl md:text-4xl">🎉</div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Saat ini anda belum berlangganan
                </h3>
                <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6">
                  Dapatkan Akses Tak Terbatas ke Ribuan Film dan Series Kesukaan Kamu!
                </p>
                <button 
                  onClick={() => setCurrentPage('premium')}
                  className="w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
                >
                  Mulai Berlangganan
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-2 sm:px-4">
          
          {/* Left Column - Profile Info */}
          <div className="space-y-4 md:space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-blue-300 rounded-full flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="40" r="18" fill="#2563eb"/>
                        <path d="M 20 85 Q 50 65, 80 85" fill="#2563eb"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center sm:text-left">
                <label className="cursor-pointer inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="px-4 py-2 border border-gray-600 rounded-full text-sm text-white hover:bg-gray-800 transition-colors">
                    Ubah Foto
                  </div>
                </label>
                <p className="text-xs text-gray-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                  Maksimal 10MB (JPG, PNG, GIF, WebP)
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 md:space-y-4">
              {/* Username */}
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <label className="text-xs md:text-sm text-gray-400">Nama Pengguna</label>
                  <button 
                    onClick={() => handleEditClick('username')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 size={14} className="md:size-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-transparent text-white text-sm md:text-base outline-none"
                  disabled={editingField !== 'username' && !editing}
                />
              </div>

              {/* Email */}
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <label className="text-xs md:text-sm text-gray-400">Email</label>
                  <button 
                    onClick={() => handleEditClick('email')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 size={14} className="md:size-4" />
                  </button>
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent text-white text-sm md:text-base outline-none"
                  placeholder="email@example.com"
                  disabled={editingField !== 'email' && !editing}
                />
              </div>

              {/* Password */}
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <label className="text-xs md:text-sm text-gray-400">Kata Sandi</label>
                  <button 
                    onClick={() => handleEditClick('password')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Edit2 size={14} className="md:size-4" />
                  </button>
                </div>
                <input
                  type={editingField === 'password' ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={editingField === 'password' ? "Masukkan password baru" : "••••••••••••••"}
                  className="w-full bg-transparent text-white text-sm md:text-base outline-none"
                  disabled={editingField !== 'password'}
                />
                {editingField === 'password' && (
                  <p className="text-xs text-gray-400 mt-1 md:mt-2">Password minimal 6 karakter</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <button 
                  onClick={handleSave}
                  className="w-full px-6 py-2.5 md:px-8 md:py-3 bg-[#0E50CA] text-white rounded-full font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  Simpan Perubahan
                </button>
                {editing && (
                  <button 
                    onClick={handleCancel}
                    className="w-full px-6 py-2.5 md:px-8 md:py-3 bg-gray-700 text-white rounded-full font-medium hover:bg-gray-600 transition-colors text-sm md:text-base"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-4 md:pt-6">
              <button 
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-600 text-red-400 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm md:text-base"
              >
                Keluar Akun
              </button>
            </div>
          </div>

          {/* Right Column - Premium Card - Desktop Only */}
          <div className="hidden lg:block mt-4 md:mt-0">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="text-2xl md:text-4xl">🎉</div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold mb-2">
                    Saat ini anda belum berlangganan
                  </h3>
                  <p className="text-xs md:text-sm text-gray-300 mb-4 md:mb-6">
                    Dapatkan Akses Tak Terbatas ke Ribuan Film dan Series Kesukaan Kamu!
                  </p>
                  <button 
                    onClick={() => setCurrentPage('premium')}
                    className="w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
                  >
                    Mulai Berlangganan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Saya Section */}
        <div className="mt-8 md:mt-12 px-2 sm:px-4">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">Daftar Saya</h2>
            <button 
              onClick={() => setCurrentPage("mylist")}
              className="text-xs md:text-sm text-gray-400 hover:text-white"
            >
              Lihat Semua
            </button>
          </div>

          {myList.length === 0 ? (
            <p className="text-gray-400 text-center py-8 md:py-10 text-sm md:text-base">Belum ada film di daftar Anda.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 pb-3 md:pb-4">
              {myList.slice(0, 12).map((item) => (
                <div key={item.id} className="flex-shrink-0">
                  <div className="relative group cursor-pointer" onClick={() => handleMovieClick(item)}>
                    <div className="overflow-hidden rounded-lg bg-[#0f0f0f] shadow-sm" style={{ aspectRatio: '9/14' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute left-0 right-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold truncate">{item.title}</div>
                          <div className="flex items-center gap-2">
                            <div className="bg-black/40 backdrop-blur-sm p-1 rounded-full">
                              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMyList(item); }}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                      title="Hapus dari daftar"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>

                    {item.top && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">Episode Baru</div>
                      </div>
                    )}

                    {item.rating && parseFloat(item.rating) >= 8.0 && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">Top 10</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Interaktif (Logo TETAP, Fitur SAMA DENGAN APP.JSX) */}
      <footer className="bg-[#0a0a0a] border-t border-gray-800 pt-16 pb-12 px-6 md:px-12 w-full mt-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* Mobile View */}
          <div className="lg:hidden">
            {/* Logo & Copyright (LOGO TETAP) */}
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
            {/* LEFT: Logo & Copyright */}
            <div className="mb-8 max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <img src="/icons/logo-chill.png" alt="Logo Chill" className="w-10 h-auto" />
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
                
                  <div className="flex flex-col gap-4">
                      <FooterGenreButton name="Aksi" />
                      <FooterGenreButton name="Anak-anak" />
                      <FooterGenreButton name="Anime" />
                      <FooterGenreButton name="Britania" />
                  </div>
                 
                  <div className="flex flex-col gap-4">
                      <FooterGenreButton name="Drama" />
                      <FooterGenreButton name="Fantasi Ilmiah & Fantasi" />
                      <FooterGenreButton name="Kejahatan" />
                      <FooterGenreButton name="KDrama" />
                  </div>
                 
                  <div className="flex flex-col gap-4">
                      <FooterGenreButton name="Komedi" />
                      <FooterGenreButton name="Petualangan" />
                      <FooterGenreButton name="Perang" />
                      <FooterGenreButton name="Romantis" />
                  </div>
                  
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

      {/* Movie Detail Modal */}
      {showMovieModal && selectedMovie && (
        <MovieDetailModal
          selectedMovie={selectedMovie}
          closeModal={closeMovieModal}
          toggleMyList={toggleMyList}
          isInMyList={(movieId) => isInMyList(movieId)}
          movies={movies}
          openMovie={openMovieModal}
        />
      )}
    </div>
  );
};

export default Profile;
