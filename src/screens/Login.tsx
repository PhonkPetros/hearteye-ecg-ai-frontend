import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import logger from "../logger";
import authService from "../services/authService";

type FormData = {
  username: string;
  password: string;
};

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup
    .string()
    .min(4, "Password must be at least 4 characters")
    .required("Password is required"),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setLoginError("");
    logger.info("Attempting login for user:", data.username);
    try {
      await authService.login(data);
      logger.info("Login successful for user:", data.username);
      navigate("/dashboard");
    } catch (error: any) {
      const message = error?.response?.data?.error || "Login failed";
      logger.error(
        "Login failed for user:",
        data.username,
        "| Reason:",
        message,
        error
      );
      setLoginError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 relative">
      <img
        src="/LogoHeader.png"
        alt="Company Logo"
        className="absolute top-6 left-6 w-60 h-auto"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-600 font-medium mb-1"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register("username")}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.username
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            placeholder="johndoe"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-600 font-medium mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-400"
            }`}
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {loginError && (
          <p className="text-red-500 text-sm mt-1 mb-4">{loginError}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || loading}
          className={`w-full text-white py-2 rounded-md transition ${
            isValid && !loading
              ? "bg-hearteye_blue hover:bg-hearteye_blue_hover"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="text-sm text-center mt-4">
          <Link
            to="/register"
            className="font-medium text-orange hover:text-hearteye_orange"
          >
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
