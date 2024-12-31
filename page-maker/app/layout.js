import '../styles/globals.css';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const emojiSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <text x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="central">
        📌
      </text>
    </svg>
  `;
const svgBase64 = Buffer.from(emojiSvg).toString('base64');
const svgUrl = `data:image/svg+xml;base64,${svgBase64}`;

export const metadata = {
  title: 'Notion Next.js blog',
  description: 'Notion Next.js blog',
  icons: {
    icon: svgUrl,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
