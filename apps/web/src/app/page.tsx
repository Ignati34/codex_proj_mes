import { APP_NAME } from "@bridgecall/shared";

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>{APP_NAME}</h1>
      <p>BridgeCall MVP scaffold is running.</p>
    </main>
  );
}
