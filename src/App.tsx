import AppRouter from "./app/AppRouter";
import { MetadataProvider } from "./contexts/MetadataContext";

export default function App() {
  return (
    <div className="app-frame">
      <MetadataProvider>
        <AppRouter />
      </MetadataProvider>
    </div>
  );
}
