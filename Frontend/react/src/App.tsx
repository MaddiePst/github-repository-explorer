import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import { useAuth } from "./hooks/useAuth"; // <-- import hook to check login state

export default function App() {
  const { user, logout } = useAuth(); // get user and logout function from context

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="font-bold text-2xl text-gray-100">
            GitHub Repo Explorer
          </Link>

          {/* Navigation */}
          <nav className="space-x-4 flex items-center">
            {/* Show only if logged in */}
            {user && (
              <Link
                to="/favorites"
                className="text-lg text-gray-100 hover:text-yellow-300 transition"
              >
                Favorites
              </Link>
            )}

            {/* If not logged in */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-lg text-gray-100 hover:text-yellow-300 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-lg text-gray-100 hover:text-yellow-300 transition"
                >
                  Register
                </Link>
              </>
            )}

            {/* If logged in, show Logout button */}
            {user && (
              <button
                onClick={logout}
                className="text-lg text-gray-100 hover:text-red-300 transition"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}
