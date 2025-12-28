import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { validateLogin, saveCurrentUser } from "../auth";
import useStore from "../store";

const NEON_RED = "#E50914";

const inputInlineStyle = {
  backgroundColor: "transparent",
  WebkitBoxShadow: "0 0 0 1000px transparent inset",
  boxShadow: "0 0 0 1000px transparent inset",
  WebkitTextFillColor: "#ffffff",
  color: "#ffffff",
};

const Login = () => {
  // Zustand store
  const { setUser, setCurrentPage } = useStore();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  // lock body scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  // Strong autofill/workaround
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const inputs = Array.from(form.querySelectorAll("input"));

    inputs.forEach((el) => {
      try {
        el.setAttribute("autocomplete", "off");
        el.setAttribute("autocorrect", "off");
        el.setAttribute("autocapitalize", "off");
        el.setAttribute("spellcheck", "false");
        el.setAttribute("readonly", "true");
        Object.assign(el.style, {
          backgroundColor: "transparent",
          WebkitBoxShadow: "0 0 0 1000px transparent inset",
          boxShadow: "0 0 0 1000px transparent inset",
          WebkitTextFillColor: "#ffffff",
          color: "#ffffff",
        });
      } catch (e) {}
      el.addEventListener("focus", function removeReadonlyOnFocus() {
        el.removeAttribute("readonly");
        el.style.caretColor = "#ffffff";
        el.removeEventListener("focus", removeReadonlyOnFocus);
      });
    });

    let tries = 0;
    const interval = setInterval(() => {
      inputs.forEach((el) => {
        Object.assign(el.style, {
          backgroundColor: "transparent",
          WebkitBoxShadow: "0 0 0 1000px transparent inset",
          boxShadow: "0 0 0 1000px transparent inset",
          WebkitTextFillColor: "#ffffff",
          color: "#ffffff",
        });
      });
      tries++;
      if (tries > 6) clearInterval(interval);
    }, 200);

    return () => {
      clearInterval(interval);
      inputs.forEach((el) => {
        try {
          el.removeAttribute("readonly");
        } catch {}
      });
    };
  }, []);

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setErr("");
    
    if (!identifier.trim() || !password) {
      setErr("Username/Email dan password wajib diisi.");
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      try {
        const valid = validateLogin(identifier.trim(), password);
        if (valid) {
          saveCurrentUser(valid);
          setUser(valid);
          setCurrentPage("home");
        } else {
          setErr("Username/Email atau password salah.");
        }
      } catch (error) {
        console.error("Login error:", error);
        setErr("Terjadi kesalahan saat mencoba masuk.");
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 modal-root">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/poster/bangku.jpg')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

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
              backdropFilter: "none",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 12,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
                pointerEvents: "none",
              }}
            />

            <div className="relative p-6 sm:p-8">
              <div className="text-center mb-4" style={{ transitionDelay: "120ms" }}>
                <div className="flex items-center justify-center gap-3">
                  <img src="/public/icons/logo-chill.png" alt="Logo" />
                  <span className="text-white font-bold text-2xl lg:text-3xl tracking-wide">
                    CHILL
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-200 mt-3">Masuk</h2>
                <p className="text-sm text-gray-400 mt-1">Selamat datang kembali!</p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <div style={{ animationDelay: "160ms" }}>
                  <label className="block text-sm text-gray-300 mb-1">Username atau Email</label>
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan username atau email"
                    autoComplete="off"
                    className="w-full netflixed-input bg-transparent border border-white/20 rounded-full px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-white/40 focus:ring-0 transition-all"
                    style={inputInlineStyle}
                  />
                </div>

                <div style={{ animationDelay: "200ms" }}>
                  <label className="block text-sm text-gray-300 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      autoComplete="new-password"
                      className="w-full netflixed-input bg-transparent border border-white/20 rounded-full px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:border-white/40 focus:ring-0 transition-all"
                      style={inputInlineStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-label="toggle-password"
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {err && (
                  <div style={{ animationDelay: "240ms" }} className="text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
                    {err}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400" style={{ animationDelay: "260ms" }}>
                  <div>
                    Belum punya akun?{" "}
                    <button type="button" onClick={() => setCurrentPage("register")} className="text-white font-semibold hover:underline">
                      Daftar
                    </button>
                  </div>
                  <button type="button" className="hover:text-white">Lupa kata sandi?</button>
                </div>

                <div style={{ animationDelay: "300ms" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white rounded-full py-3 font-semibold transition-colors"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = NEON_RED)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))")}
                  >
                    {loading ? "Masuk..." : "Masuk"}
                  </button>
                </div>

                <div className="text-center text-xs text-gray-400 my-2" style={{ animationDelay: "340ms" }}>Atau</div>

                <div style={{ animationDelay: "360ms" }}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 border border-gray-700 rounded-full py-3 text-white transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = NEON_RED)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span className="text-lg">G</span> Masuk dengan Google
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

export default Login;