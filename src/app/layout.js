import './globals.css';

export const metadata = {
  title: 'SCL Custom Dialer',
  description: 'Browser-based softphone for Bangla Calling',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}

