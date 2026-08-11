export const metadata = {
  title: "SAiMS",
  description: "School inventory and personnel management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
