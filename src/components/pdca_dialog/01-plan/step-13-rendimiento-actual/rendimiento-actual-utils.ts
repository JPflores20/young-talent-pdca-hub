export function compressImage(file: File, maxWidth = 2048, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compresión fallida"))),
          "image/jpeg",
          quality,
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export async function uploadToFirebase(file: File): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `uploads/rendimiento_actual_evidencias/${uniqueId}.${fileExt}`;
  const storageRef = ref(storage, fileName);

  let blobToUpload: Blob = file;
  if (file.type.startsWith("image/")) {
    blobToUpload = await compressImage(file);
  }

  const uploadTask = uploadBytesResumable(storageRef, blobToUpload);

  return new Promise((resolve, reject) => {
    uploadTask.on("state_changed", null, reject, async () =>
      resolve(await getDownloadURL(uploadTask.snapshot.ref)),
    );
  });
}
