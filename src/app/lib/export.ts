
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export type ExportResult = {
  filename: string;
  uri?: string;
  directory?: Directory;
};

export async function exportToCsv(
  filename: string,
  headers: string[],
  rows: any[][],
  metaInfo?: string[][]
): Promise<ExportResult> {
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
  let uri: string | undefined;
  try {
    await Filesystem.writeFile({
      path: filename,
      data: csvContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    const uriResult = await Filesystem.getUri({
      path: filename,
      directory: Directory.Documents,
    });
    uri = uriResult.uri;
  } catch (e) {
    console.error("Capacitor export failed", e);
  }

  return {
    filename,
    uri,
    directory: Directory.Documents,
  };
}
