
import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, fullWidth = false }) => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-bl from-white to-focus-background dark:from-gray-900 dark:to-gray-800">
        <div className="pt-16 pb-20 md:pb-4">
          {title && (
            <header className="py-6 px-4">
              <div className={`${fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}`}>
                <h1 className="text-2xl md:text-3xl font-bold text-focus-primary dark:text-focus-accent">{title}</h1>
              </div>
            </header>
          )}
          <main className={`px-4 ${fullWidth ? 'w-full' : 'max-w-7xl mx-auto'}`}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
