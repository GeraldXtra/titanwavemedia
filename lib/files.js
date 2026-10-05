// The files a project takes: PDF, images, Word (.docx), Excel (.xlsx), CSV, plain text and zip,
// up to 20 MB each. The browser and the server use the same rules. Each file is sent with the
// type that matches its extension, because browsers name some types differently.

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

// A safe file name for storage: letters, digits, dots, dashes and underscores.
export function storageName(name) {
  const clean = String(name || "file").normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(-120);
  return clean || "file";
}
