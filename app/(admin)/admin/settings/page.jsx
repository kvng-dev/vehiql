import { useUser } from "@clerk/nextjs";
import React from "react";
import SettingsForm from "./_components/setting-form";

export const metadata = {
  title: "Settings | Vehiql Admin",
  description: "Manage dealership working hours and admin users",
};

const SettingsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsForm />
    </div>
  );
};

export default SettingsPage;
