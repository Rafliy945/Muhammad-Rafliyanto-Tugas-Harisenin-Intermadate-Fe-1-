import React from "react";

const PremiumModal = ({ show, close, user, setUser }) => {
  if (!show) return null;

  const upgrade = () => {
    const updated = { ...user, premium: true };
    setUser(updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
    close();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center transition">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative w-11/12 max-w-lg bg-[#111] p-8 rounded-2xl border border-gray-700 text-white">
        <h1 className="text-2xl font-bold mb-3">Upgrade ke Premium ⭐</h1>

        <p className="text-gray-300 mb-6">
          Nikmati streaming tanpa iklan, kualitas 4K, dan konten eksklusif!
        </p>

        <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-2">Paket Premium</h2>
          <p className="text-gray-400 mb-1">Akses 30 Hari • Tanpa Iklan</p>
          <p className="text-3xl font-bold text-blue-400 mb-3">Rp 35.000</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={upgrade}
            className="flex-1 py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Bayar Sekarang
          </button>
          <button
            onClick={close}
            className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
