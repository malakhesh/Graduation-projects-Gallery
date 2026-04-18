// services/cloudinary.ts

export const uploadToCloudinary = async (imageUri: string) => {
  try {
    // تأكدي إن البيانات صحيحة
    const CLOUD_NAME = "df4nquqin"; // غيري ده لو مختلف في حسابك
    const UPLOAD_PRESET = "snqtqhha"; // غيري ده لو مختلف

    console.log("📸 Uploading to Cloudinary...");
    console.log("📸 Cloud Name:", CLOUD_NAME);
    console.log("📸 Upload Preset:", UPLOAD_PRESET);
    console.log("📸 Image URI:", imageUri);

    const formData = new FormData();
    
    // إضافة الصورة بالطريقة الصحيحة لـ React Native
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: `photo_${Date.now()}.jpg`,
    } as any);

    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const result = await response.json();

    console.log("🔥 Cloudinary response status:", response.status);
    console.log("🔥 Cloudinary response:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      // رسائل خطأ مفهومة
      if (result.error?.message?.includes("preset")) {
        throw new Error("❌ Upload preset not found. Please check your Cloudinary settings.");
      }
      if (result.error?.message?.includes("cloud")) {
        throw new Error("❌ Cloud name not found. Please check your Cloudinary settings.");
      }
      throw new Error(result.error?.message || "Upload failed");
    }

    if (!result.secure_url) {
      throw new Error("No secure_url returned from Cloudinary");
    }

    console.log("✅ Image uploaded successfully!");
    console.log("✅ Image URL:", result.secure_url);
    
    return result.secure_url;
    
  } catch (error: any) {
    console.error("❌ Upload error:", error.message);
    throw new Error(error.message || "Failed to upload image");
  }
};