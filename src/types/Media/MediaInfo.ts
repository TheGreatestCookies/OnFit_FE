export interface MediaInfo {
    id: number;
    presignedUrl: string;
}

export interface DocumentInfo extends MediaInfo {
    fileName: string;
}
