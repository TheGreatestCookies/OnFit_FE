import apiInstance from '@/apis/apiInstance';

interface UpdateProfileImageRequest {
    profileImageNumber: number;
}

export const updateProfileImage = async (data: UpdateProfileImageRequest) => {
    return await apiInstance.patch('/members/me/profile-image', data);
};
