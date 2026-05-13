"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GripVertical, Trash2, Upload, AlertCircle } from "lucide-react";

export type AdminImage = {
  id?: string;
  url: string;
  alt: string;
  sortOrder: number;
};

type Props = {
  value: AdminImage[];
  onChange: (next: AdminImage[]) => void;
};

export function ImageUploader({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const next = [...value];
      for (const file of Array.from(files)) {
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
        next.push({
          url: publicUrl,
          alt: file.name.replace(/\.[^.]+$/, ""),
          sortOrder: next.length,
        });
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sortOrder: i }));
    onChange(next);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })));
  };

  const updateAlt = (idx: number, alt: string) => {
    const next = [...value];
    next[idx] = { ...next[idx], alt };
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-line p-6 text-center hover:border-ink transition-colors"
      >
        <Upload size={20} className="mx-auto text-ink/55" />
        <p className="font-mono-tight text-ink/55 mt-2">
          Drop images, or
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="mt-2 font-mono-tight border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Choose files"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="font-mono-tight text-ink/40 mt-3 text-[0.65rem]">
          Uploaded directly to your Cloudflare R2 bucket via presigned URL.
        </p>
      </div>

      {error && (
        <p className="mt-3 bg-vermillion/10 border-l-2 border-vermillion px-3 py-2 font-mono-tight text-ink-soft inline-flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-5 space-y-2">
          {value.map((img, i) => (
            <li
              key={img.id ?? img.url}
              className="flex items-center gap-3 border border-line p-2"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="text-ink/40 hover:text-ink disabled:opacity-30"
                  aria-label="Move up"
                >
                  <GripVertical size={14} />
                </button>
              </div>
              <div className="relative w-16 h-20 bg-paper-deep shrink-0">
                <Image src={img.url} alt={img.alt} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <input
                  value={img.alt}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  placeholder="Alt text"
                  className="w-full bg-transparent border-b border-line py-1 outline-none focus:border-ink font-display"
                />
                <p className="font-mono-tight text-ink/40 truncate text-[0.65rem]" title={img.url}>
                  {img.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                className="text-ink/40 hover:text-vermillion p-2"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
