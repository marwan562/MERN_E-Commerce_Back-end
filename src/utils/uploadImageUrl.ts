import { v2 as cloudinary } from "cloudinary";
export const uploadImageUrl = async (image: Express.Multer.File) => {
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataUrl = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = (await cloudinary.uploader.upload(dataUrl)).url;

  return uploadResponse;
};
