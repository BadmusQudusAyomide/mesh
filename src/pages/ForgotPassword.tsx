import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "../lib/api";
import { useToast } from "../components/ui/toast";

export default function ForgotPassword() {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiService.forgotPassword(email);
      setSuccess(response.message);
      addToast({
        type: "success",
        title: "Reset Link Sent",
        message: response.message,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to request password reset";
      setError(message);
      addToast({
        type: "error",
        title: "Reset Request Failed",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
            <span className="text-xl font-bold text-gray-800">M</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Reset your password
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl font-medium text-center text-gray-900">
              Forgot password
            </CardTitle>
            <CardDescription className="text-center text-gray-500 text-sm">
              This works for password-based accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 bg-white/50 border-gray-200 focus:border-gray-300"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : (
                  <div className="flex items-center space-x-2">
                    <span>Send reset link</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
