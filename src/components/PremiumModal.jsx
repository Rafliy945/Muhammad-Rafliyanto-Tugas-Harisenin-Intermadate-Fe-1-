import React from "react";
import PremiumSubscription from "./PremiumSubscription";

const PremiumModal = ({ show, close, user, setUser, setShowPremiumModal }) => {
  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={close}
        className="fixed inset-0 bg-black/80 z-[9990]"
      />
      
      {/* Modal Content */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-4xl h-[90vh] overflow-auto bg-black rounded-2xl border border-gray-700">
        {/* Tombol X */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white bg-black/80 rounded-full p-2 hover:bg-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <PremiumSubscription
          user={user}
          setUser={setUser}
          setShowPremiumModal={setShowPremiumModal}
          isModal={true}
          closeModal={close}
        />
      </div>
    </>
  );
};

export default PremiumModal;