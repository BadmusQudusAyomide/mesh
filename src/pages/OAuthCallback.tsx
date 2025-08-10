import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContextHelpers";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const next = searchParams.get("next") || "/home";

    const run = async () => {
      try {
        if (!token) throw new Error("Missing token in callback");
        await oauthLogin(token);
        navigate(next, { replace: true });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "OAuth sign-in failed";
        setError(msg);
        // Redirect back to login after brief pause
        setTimeout(() => navigate("/", { replace: true }), 2000);
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
          <span className="text-2xl font-bold text-white">M</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Finishing sign-in…</h1>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm">Please wait</span>
          </div>
        )}
      </div>
    </div>
  );
}
