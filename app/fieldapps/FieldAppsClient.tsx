"use client";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/Button";
import OfflineIndicator from "../../components/OfflineIndicator";

interface ActionItem {
  id: string;
  type: string;
  details: string;
}

export default function FieldAppsClient() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [queue, setQueue] = useState<ActionItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [showQueue, setShowQueue] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("fieldQueue");
    if (stored) setQueue(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (online && queue.length > 0) {
      setSyncing(true);
      setTimeout(() => {
        setQueue([]);
        localStorage.setItem("fieldQueue", "[]");
        setLastSynced(new Date());
        setSyncing(false);
      }, 1000);
    }
  }, [online, queue]);

  const addAction = (action: ActionItem) => {
    setQueue((q) => {
      const updated = [...q, action];
      localStorage.setItem("fieldQueue", JSON.stringify(updated));
      return updated;
    });
  };

  const capturePhoto = () => {
    if (!fileInput.current) return;
    fileInput.current.click();
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (navigator.vibrate) navigator.vibrate(100);
        const details = `Lat ${pos.coords.latitude.toFixed(3)}, Lng ${pos.coords.longitude.toFixed(3)}`;
        const item: ActionItem = {
          id: Date.now().toString(),
          type: "photo",
          details,
        };
        if (online) {
          setSyncing(true);
          setTimeout(() => {
            setLastSynced(new Date());
            setSyncing(false);
          }, 500);
        } else {
          addAction(item);
        }
      },
      () => {
        const item: ActionItem = {
          id: Date.now().toString(),
          type: "photo",
          details: "GPS unavailable",
        };
        if (!online) addAction(item);
      },
    );
  };

  return (
    <main className="min-h-screen pt-32 px-4 max-w-3xl mx-auto bg-bg relative">
      <OfflineIndicator online={online} syncing={syncing} />
      <h1 className="text-3xl font-bold text-center mb-4">Field App</h1>
      <p className="text-center text-text-secondary mb-6">
        Capture data even when offline.
      </p>
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={capturePhoto}
          className={online ? "" : "opacity-50"}
          aria-label="Capture GPS photo"
        >
          {syncing ? "Saving..." : "GPS Photo"}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPhoto}
        />
        <Button onClick={() => setShowQueue(true)} variant="secondary">
          Sync Queue ({queue.length})
        </Button>
        {lastSynced && (
          <p className="text-sm text-text-secondary">
            Last synced {lastSynced.toLocaleTimeString()}
          </p>
        )}
      </div>
      {showQueue && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Offline Actions</h2>
            {queue.length === 0 ? (
              <p className="text-sm">No actions queued.</p>
            ) : (
              <ul className="text-sm space-y-2 max-h-60 overflow-y-auto">
                {queue.map((item) => (
                  <li key={item.id} className="border-b pb-1">
                    {item.type}: {item.details}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={() => setShowQueue(false)}
                size="sm"
                variant="secondary"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
