"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload, X, AlertCircle } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  /** Optional alt text bound to a separate setting. */
  altValue?: string;
  onAltChange?: (alt: string) => void;
  label?: string;
};

export function SingleImagePicker({ value, onChange, altValue, onAltChange, label }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const presign = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presign.ok) {
        const body = await presign.json().catch(() => ({}));
        throw new Error(body.error ?? `Failed to get upload URL (${presign.status})`);
      }
      const { uploadUrl, publicUrl } = await presign.json();
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`R2 PUT failed (${put.status})`);
      onChange(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      {label && <p className="font-mono-tight text-ink/55 mb-2">{label}</p>}

      {value ? (
        <div className="flex items-start gap-4">
          <div className="relative w-40 aspect-[3/2] bg-paper-deep border border-line shrink-0">
            <Image src={value} alt={altValue || "Banner image"} fill sizes="160px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-paper inline-flex items-center justify-center hover:bg-vermillion"
            >
              <X size={12} />
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {onAltChange && (
              <div className="border-b border-line py-2">
                <label className="font-mono-tight text-ink/55 block">Alt text</label>
                <input
                  value={altValue ?? ""}
                  onChange={(e) => onAltChange(e.target.value)}
                  placeholder="Describes the image for screen readers"
                  className="w-full bg-transparent py-1 outline-none font-display"
                />
              </div>
            )}
            <p className="font-mono-tight text-ink/40 truncate text-[0.65rem]" title={value}>
              {value}
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="font-mono-tight border border-line px-3 py-1.5 hover:border-ink disabled:opacity-50"
            >
              {busy ? "Replacing…" : "Replace image"}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
          className="border-2 border-dashed border-line p-6 text-center hover:border-ink transition-colors max-w-md"
        >
          <Upload size={20} className="mx-auto text-ink/55" />
          <p className="font-mono-tight text-ink/55 mt-2">Drop an image, or</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="mt-2 font-mono-tight border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Choose file"}
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />

      {error && (
        <p className="mt-3 bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft inline-flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}
