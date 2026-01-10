import type { ReactNode } from "react";

export const metadata = {
  title: "BridgeCall",
  description: "BridgeCall MVP"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
