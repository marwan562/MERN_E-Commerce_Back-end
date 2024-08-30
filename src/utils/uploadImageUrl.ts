import { v2 as cloudinary } from "cloudinary";

export const uploadImageUrl = async (
  image: Express.Multer.File
): Promise<string> => {
  try {
   
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataUrl = `data:${image.mimetype};base64,${base64Image}`;
    const { url } = await cloudinary.uploader.upload(dataUrl);

    return url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};
