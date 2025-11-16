import React from "react";
import { useMsal } from "@azure/msal-react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup({
      mainWindowRedirectUri:
        window.location.hostname === "localhost"
          ? "http://localhost:5173"
          : "https://cleverconnection.github.io/ColaboradoresCRM",
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white shadow transition"
    >
      <LogOut size={18} />
      Sair
    </button>
  );
}
