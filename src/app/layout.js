import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RealtimeNotifications from '@/components/layout/RealtimeNotifications';

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

        <RealtimeNotifications />
        
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
        
      </body>
    </html>
  );
}