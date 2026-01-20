import { getPresignedUrl } from '@/apis/media/getPresignedUrl';
import type { DocumentInfo, MediaInfo } from '@/types/Media/MediaInfo';

async function putToS3(presignedUrl: string, file: File) {
    let uploadUrl = presignedUrl;
    if (import.meta.env.DEV) {
        uploadUrl = presignedUrl.replace('https://s3-test-yunjae.s3.ap-northeast-2.amazonaws.com', '/aws-s3');
    }

    await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type || 'application/octet-stream',
        },
    });
}

// 쿼리 파라미터 제거하여 짧은 URL로 저장
export function cleanUrl(presignedUrl: string) {
    return presignedUrl.split('?')[0];
}

export async function uploadImageFiles(files: File[]) {
    const results: MediaInfo[] = [];
    for (const f of files) {
        const { id, presignedUrl } = await getPresignedUrl();
        await putToS3(presignedUrl, f);
        results.push({ id, presignedUrl: cleanUrl(presignedUrl) });
    }
    return results;
}

export async function uploadVideoFile(file: File) {
    const { id, presignedUrl } = await getPresignedUrl();
    await putToS3(presignedUrl, file);
    return { id, presignedUrl: cleanUrl(presignedUrl) };
}

// 축제 관리자 신청 용 문서 업로드 함수
export async function uploadDocumentFiles(files: File[]) {
    const results: DocumentInfo[] = [];
    for (const file of files) {
        const { id, presignedUrl } = await getPresignedUrl();
        await putToS3(presignedUrl, file);
        results.push({
            id,
            presignedUrl: cleanUrl(presignedUrl),
            fileName: file.name,
        });
    }
    return results;
}
