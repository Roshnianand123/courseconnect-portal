import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export const metadata = {
  title: 'CourseConnect – Student Course Registration Portal',
  description: 'A modern, responsive university course registration portal. View available courses, manage student profiles, register for classes, and track campus enrollment in real time.',
  keywords: 'course registration, student portal, university enrollment, higher education, courses'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Dynamic Background Glow Elements */}
        <div className="bg-ambient" aria-hidden="true">
          <div className="ambient-orb-1"></div>
          <div className="ambient-orb-2"></div>
        </div>

        <main id="main-content" className="portal-container">
          {children}
        </main>
      </body>
    </html>
  );
}
