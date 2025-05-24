import { useEffect, useState } from "react";
import { auth } from "~/utils/firebaseClient";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      // console.log("Auth state changed:", u);
      // localStorage.setItem("googleAccessToken", u?.accessToken!);
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-[#4B3576] text-white">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Whispr Logo" className="h-8" />
        </a>
        <div>Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 bg-[#4B3576] text-white">
      <a href="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Whispr Logo" className="h-8" />
      </a>
      <div>
        {user ? (
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/past-meetings" className="hover:underline">Past Meetings</a>
            <span>{user.displayName || user.email}</span>
            <button
              className="bg-white/10 px-4 py-2 rounded hover:bg-white/20 transition-colors"
              onClick={() => {
                signOut(auth).then(() => {
                  localStorage.removeItem('googleAccessToken');
                  window.location.href = "/";
                }).catch(error => {
                  console.error('Error signing out:', error);
                });
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <a href="/" className="hover:underline">Home</a>
        )}
      </div>
    </nav>
  );
} 