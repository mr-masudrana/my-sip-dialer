import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'SCL Custom Janus Dialer',
  description: 'Browser-based softphone using Janus Gateway',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* WebRTC Adapter এবং Janus অফিশিয়াল স্ক্রিপ্ট */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/webrtc-adapter/8.2.3/adapter.min.js" strategy="beforeInteractive" />
        <Script src="https://janus.conf.meetecho.com/janus.js" strategy="beforeInteractive" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
