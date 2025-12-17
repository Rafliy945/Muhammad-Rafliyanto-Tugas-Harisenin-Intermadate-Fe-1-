import React from "react";

const PremiumSection = ({ setShowPremiumModal }) => {
  return (
    <div className="mb-6 md:mb-8 px-2 sm:px-4">
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
              onClick={() => setShowPremiumModal(true)}
              className="w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
            >
              Mulai Berlangganan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSection;