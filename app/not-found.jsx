"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Custom404 = () => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(60); // Set initial time to 60 seconds

  useEffect(() => {
    // Countdown logic
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/"); // Redirect after countdown finishes
        }
        return prev - 1;
      });
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">
        Oops! The page you're looking for does not exist.
      </p>
      <p className="text-md mb-8">
        You will be redirected to the homepage in {timeLeft} seconds.
      </p>
      <div className="mt-8">
        <a
          href="/"
          className="text-lg text-blue-500 hover:text-blue-300 transition"
        >
          Go back to homepage
        </a>
      </div>
    </div>
  );
};

export default Custom404;
