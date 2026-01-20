export const SYSTEM_MESSAGES = {
    MEDIA_UPLOAD: {
        IMAGE_LIMIT_EXCEEDED: (max: number, current: number) =>
            `이미지는 최대 ${max}장까지 업로드할 수 있습니다. (현재 ${current}장)`,
        VIDEO_LIMIT_EXCEEDED: '동영상은 1개만 업로드할 수 있습니다.',
        FILE_SIZE_EXCEEDED: (maxSize: string) =>
            `파일 크기는 ${maxSize}를 초과할 수 없습니다.`,
        UNSUPPORTED_FILE_TYPE: '지원하지 않는 파일 형식입니다.',
    },
};
