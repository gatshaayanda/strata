import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// UploadThing is enabled for future Strata image/PDF attachment workflows.
// No customer-facing upload form is wired into the ordering journey yet.
export const ourFileRouter = {
  fileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async () => {
    // No upload completion workflow is enabled for Strata.
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
