import React, { useState } from "react";

const Profile = ({ user, setUser, myList = [], toggleMyList, setShowPremiumModal, setCurrentPage }) => {
  const [editing, setEditing] = useState(false);

 
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-28 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full text-center">
          <h2 className="text-2xl font-semibold mb-4">Kamu belum login</h2>
          <p className="text-gray-400 mb-6">Silakan masuk untuk mengakses profil.</p>

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setCurrentPage("login")}
              className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              Masuk
            </button>
            <button 
              onClick={() => setCurrentPage("register")}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
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

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4">
      <div className="max-w-4xl mx-auto bg-[#111] p-8 rounded-2xl border border-gray-800">
        
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl font-bold">
            {user.username[0].toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl font-semibold">{user.username}</h1>
            <p className="text-gray-400">{user.email || "Tidak ada email"}</p>

            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm px-3 py-1 bg-gray-800 rounded-full">
                {user.premium ? "Premium ⭐" : "Free Plan"}
              </span>

              {!user.premium && (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="text-sm bg-blue-600 px-3 py-1 rounded-full hover:bg-blue-700"
                >
                  Upgrade Premium
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="ml-auto px-4 py-2 bg-red-700 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <p className="text-gray-400 text-sm">Nama Pengguna</p>
            <p className="font-semibold">{user.username}</p>
          </div>

          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="font-semibold">{user.premium ? "Premium ⭐" : "Free"}</p>
          </div>

          <div className="p-4 bg-[#0a0a0a] rounded-lg">
            <p className="text-gray-400 text-sm">Jumlah Favorit</p>
            <p className="font-semibold">{myList.length}</p>
          </div>
        </div>

        {/* Daftar Saya */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Daftar Saya</h2>

          {myList.length === 0 ? (
            <p className="text-gray-400">Belum ada film di daftar Anda.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {myList.map((item) => (
                <div key={item.id} className="bg-[#0b0b0b] rounded-lg overflow-hidden">
                  <div className="relative">
                    <img src={item.image} alt="" className="w-full h-44 object-cover" />
                    <button
                      onClick={() => toggleMyList(item)}
                      className="absolute top-2 right-2 bg-black/60 p-2 rounded-full"
                    >
                      ❌
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-400">
                      {(item.genres || []).join(" • ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
