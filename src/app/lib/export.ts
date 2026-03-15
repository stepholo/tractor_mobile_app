
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export async function exportToCsv(filename: string, headers: string[], rows: any[][], metaInfo?: string[][]) {
  const metaContent = metaInfo ? metaInfo.map(e => e.join(",")).join("\n") + "\n\n" : "";
  const csvContent = metaContent + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

  // Web Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Capacitor Download (Android/iOS)
  try {
    await Filesystem.writeFile({
      path: filename,
      data: csvContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
  } catch (e) {
    console.error("Capacitor export failed", e);
  }
}
