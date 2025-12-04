import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { addUser, saveCurrentUser } from "../auth";

const NEON_RED = "#E50914";

const Register = ({ setCurrentPage, setUser }) => {
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev || "");
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    setErr("");
    if (!username.trim() || !password || !confirmPassword) {
      setErr("Semua field wajib diisi.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Kata sandi tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const newUser = addUser({ username: username.trim(), password, phone });
      saveCurrentUser({
        username: newUser.username,
        premium: false,
        phone: newUser.phone,
      });
      setUser({
        username: newUser.username,
        premium: false,
        phone: newUser.phone,
      });
      setCurrentPage("home");
    } catch (error) {
      if (error.message === "USERNAME_EXISTS") {
        setErr("Username sudah terdaftar.");
      } else {
        setErr("Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 modal-root">
      {/* background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/poster/bangku.jpg')",
        }}
      />

      {/* overlay dark */}
      <div className="absolute inset-0 z-10 bg-black/55" />

      {/* vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* center */}
      <div className="relative z-30 modal-centered p-4">
        <div
          className="relative w-full max-w-sm sm:max-w-md md:max-w-lg rounded-2xl shadow-2xl modal-scrollable animate-fadeSlide overflow-y-auto scrollbar-none"
          style={{ animationDelay: "60ms" }}
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 12,
                background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
                pointerEvents: "none",
              }}
            />

            <div className="relative p-6 sm:p-8">
              <div className="text-center mb-4" style={{ transitionDelay: "120ms" }}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold" style={{
                    color: NEON_RED,
                    textShadow: "0 0 6px rgba(229,9,20,0.9), 0 0 20px rgba(229,9,20,0.35)"
                  }}>🎬</span>
                  <h1 className="text-2xl font-extrabold" style={{
                    color: NEON_RED,
                    textShadow: "0 0 8px rgba(229,9,20,0.9), 0 0 28px rgba(229,9,20,0.25)",
                    letterSpacing: "1px"
                  }}>CHILL</h1>
                </div>
                <h2 className="text-lg font-semibold text-gray-200 mt-3">Daftar</h2>
                <p className="text-sm text-gray-400 mt-1">Selamat datang!</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div style={{ animationDelay: "160ms" }}>
                  <label className="block text-sm text-gray-300 mb-1">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    autoComplete="username"
                    className="w-full netflixed-input bg-transparent border border-white/20 rounded-full px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-white/40 focus:ring-0 transition-all"
                  />
                </div>

                <div style={{ animationDelay: "180ms" }}>
                  <label className="block text-sm text-gray-300 mb-1">Nomor Telepon (opsional)</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxx"
                    autoComplete="tel"
                    className="w-full netflixed-input bg-transparent border border-white/20 rounded-full px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-white/40 transition-all"
                  />
                </div>

                <div style={{ animationDelay: "200ms" }}>
                  <label className="block text-sm text-gray-300 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showPass1 ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      autoComplete="new-password"
                      className="w-full netflixed-input bg-transparent border border-white/20 rounded-full px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-white/40 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass1(!showPass1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass1 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ animationDelay: "220ms" }}>
                  <label className="block text-sm text-gray-300 mb-1">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showPass2 ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      autoComplete="new-password"
                      className="w-full netflixed-input bg-transparent border border-white/20 rounded-full px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-white/40 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass2(!showPass2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {err && <div style={{ animationDelay: "240ms" }} className="text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">{err}</div>}

                <div className="text-xs text-gray-400" style={{ animationDelay: "260ms" }}>
                  Sudah punya akun?{" "}
                  <button type="button" onClick={() => setCurrentPage("login")} className="text-white font-semibold hover:underline">Masuk</button>
                </div>

                <div style={{ animationDelay: "300ms" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white rounded-full py-3 font-semibold transition-all"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = NEON_RED)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))")}
                  >
                    {loading ? "Memproses..." : "Daftar"}
                  </button>
                </div>

                <div className="text-center text-xs text-gray-400 my-2" style={{ animationDelay: "340ms" }}>Atau</div>

                <div style={{ animationDelay: "360ms" }}>
                  <button
                    className="w-full flex items-center justify-center gap-2 border border-gray-700 rounded-full py-3 text-white transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = NEON_RED)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-lg">G</span> Daftar dengan Google
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
