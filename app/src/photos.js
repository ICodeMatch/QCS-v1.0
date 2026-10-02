import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
export async function reduced(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const im = new Image();
    im.src = url;
    await im.decode();
    const f = Math.min(1, 1280 / Math.max(im.width, im.height)),
      canvas = document.createElement("canvas");
    canvas.width = Math.round(im.width * f);
    canvas.height = Math.round(im.height * f);
    canvas.getContext("2d").drawImage(im, 0, 0, canvas.width, canvas.height);
    return {
      data: canvas.toDataURL("image/jpeg", 0.72),
      width: canvas.width,
      height: canvas.height,
      policy: "reference-pilot-1280-jpeg-0.72",
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function nativePhotos(camera) {
  if (!Capacitor.isNativePlatform()) return null;
  const items = camera
    ? [
        await Camera.getPhoto({
          source: CameraSource.Camera,
          resultType: CameraResultType.Uri,
          saveToGallery: false,
          quality: 100,
        }),
      ]
    : (await Camera.pickImages({ quality: 100 })).photos;
  return Promise.all(
    items.map(async (p) => reduced(await (await fetch(p.webPath)).blob())),
  );
}
