import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { reduced } from './photos.js';
export function fileData(blob) {
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('No se pudo leer la fotografía.'));reader.readAsDataURL(blob);});
}
export async function evidencePhoto(blob,source='gallery',name='Fotografía') {
 if(!blob.type.startsWith('image/'))throw Error('Selecciona una imagen.');
 const preview=await reduced(blob);
 return {id:crypto.randomUUID(),data:await fileData(blob),mime:blob.type,size:blob.size,name,source,thumbnail:preview.data,previewWidth:preview.width,previewHeight:preview.height,transform:'Original recibido sin reducir; miniatura derivada',comment:''};
}
export async function nativeEvidencePhotos(camera) {
 if(!Capacitor.isNativePlatform())return null;
 const items=camera?[await Camera.getPhoto({source:CameraSource.Camera,resultType:CameraResultType.Uri,saveToGallery:false,quality:100})]:(await Camera.pickImages({quality:100})).photos;
 const out=[];
 for(const item of items){const response=await fetch(item.webPath);if(!response.ok)throw Error('No se pudo recuperar la fotografía.');out.push(await evidencePhoto(await response.blob(),camera?'camera':'gallery'));}
 return out;
}
