export interface Post {
  id: number;
  content: string;
  createdTime: string;
  imageUrls: string[];
  userId: number;
  userName: string;
  profileImage: string;
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

export const fetchPosts = async (page: number = 0, size: number = 10): Promise<PostResponse> => {
  const response = await fetch(`/api/posts?page=${page}&size=${size}`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export interface CreatePostRequest {
  content: string;
}

export const createPost = async (data: CreatePostRequest): Promise<Post> => {
  const response = await fetch('/api/posts', {
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

  return response.json();
};
