export type AvatarUploadResult = {
  avatarUrl: string;
  bucket: string;
  path: string;
};

export type AvatarUploadErrorResponse = {
  error: string;
};

export type AvatarUploadResponse = AvatarUploadResult | AvatarUploadErrorResponse;
