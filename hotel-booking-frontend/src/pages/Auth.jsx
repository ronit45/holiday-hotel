import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";
import { welcomeBackToast, welcomeNewToast } from "../utils/toast-messages";

const testAccounts = { "test-admin": { email: "test@user.com", password: "12345678" } };

const Auth = () => {
  const { showToast } = useAppContext();
  const location = useLocation();
  const isSignIn = location.pathname === "/sign-in";
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testPwd, setTestPwd] = useState("");

  const handleRoleSelect = (e) => {
    const v = e.target.value;
    setTestEmail(testAccounts[v]?.email || "");
    setTestPwd(testAccounts[v]?.password || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (data.password.length < 6) return setError("Password must be at least 6 characters.");
    if (!isSignIn && data.password !== data.confirmPassword) return setError("Passwords do not match.");

    setError(""); setIsLoading(true);
    try {
      if (isSignIn) {
        await apiClient.signIn({ email: data.email, password: data.password });
        showToast(welcomeBackToast());
      } else {
        await apiClient.register(data);
        showToast(welcomeNewToast());
      }
      setTimeout(() => window.location.href = location.state?.from?.pathname || "/", 1000);
    } catch (err) {
      setError(err.message);
      showToast({ title: "Auth Failed", description: err.message, type: "ERROR" });
    } finally { setIsLoading(false); }
  };

  const Input = ({ label, name, type="text", ...props }) => (
    <label className="block text-sm font-medium mb-4">{label}
      <input name={name} type={type} required className="w-full mt-1 p-2 border rounded" {...props} />
    </label>
  );

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded border">
        <h2 className="text-2xl font-bold text-center">{isSignIn ? "Welcome Back" : "Join HolidayHotel"}</h2>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isSignIn && (
            <label className="block text-sm font-medium mb-4">Quick Login
              <select onChange={handleRoleSelect} className="w-full mt-1 p-2 border rounded bg-white">
                <option value="clear">Select...</option>
                <option value="test-admin">Test Admin (test@user.com)</option>
              </select>
            </label>
          )}

          {!isSignIn && (
            <div className="flex gap-4">
              <Input label="First Name" name="firstName" />
              <Input label="Last Name" name="lastName" />
            </div>
          )}

          <Input label="Email Address" name="email" type="email" value={testEmail || undefined} onChange={e => setTestEmail(e.target.value)} />
          <Input label="Password" name="password" type="password" value={testPwd || undefined} onChange={e => setTestPwd(e.target.value)} />
          {!isSignIn && <Input label="Confirm Password" name="confirmPassword" type="password" />}

          <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mt-4">
            {isLoading ? "Processing..." : (isSignIn ? "Sign In" : "Create Account")}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          {isSignIn ? <>Need an account? <Link to="/register" className="text-blue-600">Create one</Link></> : <>Have an account? <Link to="/sign-in" className="text-blue-600">Sign in</Link></>}
        </p>
      </div>
    </div>
  );
};
export default Auth;
