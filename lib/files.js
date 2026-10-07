export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export const FILE_TYPES = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
  zip: "application/zip",
};

export const ACCEPT = Object.keys(FILE_TYPES).map((e) => `.${e}`).join(",");

export function fileType(name) {
  const ext = String(name || "").toLowerCase().split(".").pop();
  return FILE_TYPES[ext] || null;
}

export function storageName(name) {
  const clean = String(name || "file").normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(-120);
  return clean || "file";
}
