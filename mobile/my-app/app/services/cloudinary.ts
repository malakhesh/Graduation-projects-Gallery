// app/services/cloudinary.ts

const CLOUDINARY_CLOUD = "df4nquqin";
const CLOUDINARY_PRESET = "snqtqhha";

export async function uploadToCloudinary(file: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Upload to Cloudinary failed");
  }

  const data = await response.json();
  return data.secure_url;
}