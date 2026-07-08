export default function cloudinaryLoader({ src, width }) {
  if (!src.includes("res.cloudinary.com")) return src;
  const params = ["f_auto", "c_limit", `w_${width}`, "q_auto"];
  return src.replace("/upload/", `/upload/${params.join(",")}/`);
}
