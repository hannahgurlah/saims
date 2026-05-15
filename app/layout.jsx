export const metadata = {
  title: "School Inventory System",
  description: "School inventory and personnel management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
