import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
export async function download(data, name, type) {
  name =
    name.replace(/[^\p{L}\p{N}._ -]/gu, "_").replace(/^\.+/, "") ||
    "qcs-archivo";
  const blob = new Blob([data], { type });
  if (Capacitor.isNativePlatform()) {
    const base64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result.split(",")[1]);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
    const file = await Filesystem.writeFile({
      path: name,
      data: base64,
      directory: Directory.Cache,
    });
    await Share.share({ title: name, files: [file.uri] });
    return;
  }
  const a = document.createElement("a"),
    url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
