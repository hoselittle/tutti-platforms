import './globals.css';
import { Toaster } from 'react-hot-toast';

// 1. 👉 Bring your Header and Footer imports back!
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Tutti Platforms',
  description: 'Connect with accompanists in Sydney',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 min-h-screen flex flex-col text-zinc-900">
        
        {/* The global Toaster container */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b', // zinc-900
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e', // green-500
                secondary: '#fff',
              },
            },
          }} 
        />
        
        {/* 2. 👉 Put the Header back at the top of the app! */}
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        {/* 3. 👉 Put the Footer back at the bottom! */}
        <Footer />
        
      </body>
    </html>
  );
}