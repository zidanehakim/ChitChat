import * as Yup from "yup";

export const initialProfileSchema = Yup.object().shape({
  username: Yup.string()
    .required("• Enter username")
    .min(3, "• Username must be at least 3 characters"),
  status: Yup.string().required("• Enter initial status"),
  image: Yup.mixed()
    .required("Upload profile image")
    .test("fileFormat", "Image type only", (value: any) => {
      if (value) {
        const supportedFormats = ["jpg", "png", "jpeg", "webp"];
        return supportedFormats.includes(value.name.split(".").pop());
      }
      return true;
    })
    .test("fileSize", "File size must be less than 5MB", (value: any) => {
      if (value) {
        return value.size <= 1048576 * 5;
      }
      return true;
    }),
  wallpaper: Yup.mixed()
    .required("Upload profile wallpaper")
    .test("fileFormat", "Image type only", (value: any) => {
      if (value) {
        const supportedFormats = ["jpg", "png", "jpeg", "webp"];
        return supportedFormats.includes(value.name.split(".").pop());
      }
      return true;
    })
    .test("fileSize", "File size must be less than 5MB", (value: any) => {
      if (value) {
        return value.size <= 1048576 * 5;
      }
      return true;
    }),
});

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please input valid email")
    .required("This field is required"),
});
