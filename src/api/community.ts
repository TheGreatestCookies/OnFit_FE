export interface Post {
  id: number;
  tile?: string; // 백엔드에 있지만 프론트엔드에서 사용하지 않음 (오타로 보임, title이어야 할 것 같음)
  content: string;
  createdTime: string;
  imageUrls: string[];
  userId: number;
  userName: string;
  profileImageNumber: number;
  likeCnt: number;
  myLike: boolean;
}

export interface PostResponse {
  content: Post[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

import { API_BASE_URL } from '@/utils/apiConfig';

export const fetchPosts = async (page: number = 0, size: number = 10): Promise<PostResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts?page=${page}&size=${size}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export interface CreatePostRequest {
  title?: string;
  content: string;
  imagesUrls?: string[];
}

export const createPost = async (data: CreatePostRequest): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  // 201 Created의 경우 응답 본문이 비어있을 수 있으므로
  // 성공 여부만 확인하고 실제 데이터는 목록 새로고침으로 가져옴
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    if (text) {
      // 응답 본문이 있으면 파싱 (일부 서버는 본문을 반환할 수 있음)
      try {
        JSON.parse(text);
      } catch {
        // 파싱 실패해도 201이면 성공으로 처리
      }
    }
  }
};

// 오늘 작성한 글이 있는지 확인 (true: 글 작성 가능)
export const checkCanWritePost = async (): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/check`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    throw { status: 401, message: 'Unauthorized' };
  }

  if (!response.ok) {
    throw new Error('Failed to check post');
  }

  return response.json();
};

// 내가 쓴 게시글 조회
export const fetchMyPosts = async (page: number = 0, size: number = 10): Promise<PostResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/my?page=${page}&size=${size}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch my posts');
  }

  return response.json();
};

// 게시글 수정
export interface UpdatePostRequest {
  content: string;
  imagesUrls?: string[];
}

export const updatePost = async (postId: number, data: UpdatePostRequest): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update post');
  }
};

// 게시글 삭제
export const deletePost = async (postId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
};

// 좋아요 추가
export const likePost = async (postId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to like post');
  }
};

// 좋아요 취소
export const unlikePost = async (postId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to unlike post');
  }
};

// 내가 좋아요한 게시글 조회
export const fetchLikedPosts = async (page: number = 0, size: number = 10): Promise<PostResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/posts/like/my?page=${page}&size=${size}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch liked posts');
  }

  return response.json();
};
