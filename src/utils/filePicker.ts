import { uploadImageFiles, uploadVideoFile } from '@/utils/mediaUpload';
import type { MediaInfo } from '@/types/Media/MediaInfo';

export const createImagePicker = (
    onUpload: (uploaded: MediaInfo[]) => void,
    setIsUploading: (isUploading: boolean) => void,
    onError: (message: string) => void,
) => {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setIsUploading(true);
            const fileList = Array.from(files);
            const uploaded = await uploadImageFiles(fileList);
            onUpload(uploaded);
        } catch (error) {
            console.error(error);
            onError('이미지 업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };
};

export const createVideoPicker = (
    onUpload: (uploaded: MediaInfo) => void,
    setIsUploading: (isUploading: boolean) => void,
    onError: (message: string) => void,
) => {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        try {
            setIsUploading(true);
            const uploaded = await uploadVideoFile(file);
            onUpload(uploaded);
        } catch (error) {
            console.error(error);
            onError('동영상 업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };
};
