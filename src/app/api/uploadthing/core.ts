import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Legacy form components still type-check while the UploadThing route is disabled.
// Strata's active customer journey does not accept uploads yet.
export const ourFileRouter = {
  fileUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async () => {
    // No upload completion workflow is enabled for Strata.
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
