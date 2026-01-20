import { useState, useEffect } from 'react';
import { fetchMyHomeWorkoutRecommendations, fetchMyVoucherRecommendations } from '@/api/recommendation';
import { fetchLikedVouchers } from '@/api/voucher';
import VoucherCard from '@/pages/Voucher/components/VoucherCard';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { FaceOptions } from '@/constants/FaceOptions';
import CharacterIcon from '@/components/icon/CharacterIcon';
import { CharacterRecommendationMessages } from '@/constants/CharacterMessages';
import { API_BASE_URL } from '@/utils/apiConfig';
import FireIcon from '@/components/icon/FireIcon';
import MuscleIcon from '@/components/icon/MuscleIcon';
import MeditationIcon from '@/components/icon/MeditationIcon';

const RecommendationHistoryContent = () => {
  const [activeTab, setActiveTab] = useState<'voucher' | 'workout'>('voucher');
  const [voucherData, setVoucherData] = useState<any>(null);
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [likingVoucherIds, setLikingVoucherIds] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();
  const { userInfo } = useAuth();


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [vouchers, workouts] = await Promise.all([
          fetchMyVoucherRecommendations(),
          fetchMyHomeWorkoutRecommendations(),
        ]);

        // 로그인한 사용자인 경우 좋아요한 바우처 목록을 가져와서 매칭
        if (userInfo && vouchers && Array.isArray(vouchers)) {
          try {
            const likedVouchersResponse = await fetchLikedVouchers(0, 1000); // 모든 좋아요한 바우처 가져오기
            const likedVoucherIds = new Set(
              likedVouchersResponse.content.map((v: any) => v.id)
            );
            
            // likedVouchersResponse에서 likeCnt를 매핑하기 위한 Map 생성
            const likedVoucherLikeCntMap = new Map<number, number>();
            likedVouchersResponse.content.forEach((v: any) => {
              if (v.likeCnt !== null && v.likeCnt !== undefined) {
                likedVoucherLikeCntMap.set(v.id, v.likeCnt);
              }
            });

            // 추천 기록의 각 바우처에 좋아요 정보 추가
            const enrichedVouchers = vouchers.map((recommendation: any) => ({
              ...recommendation,
              vouchers: recommendation.vouchers?.map((voucher: any) => {
                // likeCnt 우선순위: 1) fetchMyVoucherRecommendations 응답의 likeCnt, 2) fetchLikedVouchers 응답의 likeCnt, 3) 0
                const likeCnt = voucher.likeCnt ?? likedVoucherLikeCntMap.get(voucher.id) ?? 0;
                
                return {
                  ...voucher,
                  myLike: likedVoucherIds.has(voucher.id),
                  likeCnt: likeCnt,
                };
              }),
            }));

            setVoucherData(enrichedVouchers);
          } catch (error) {
            console.error('좋아요 정보 조회 실패:', error);
            // 좋아요 정보 조회 실패해도 추천 기록은 표시
            setVoucherData(vouchers);
          }
        } else {
          setVoucherData(vouchers);
        }

        setWorkoutData(workouts);
      } catch (error) {
        console.error('추천 기록 조회 실패:', error);
        toast.error('추천 기록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  const handleLike = async (voucherId: number) => {
    // 중복 클릭 방지
    if (likingVoucherIds.has(voucherId)) {
      return;
    }

    setLikingVoucherIds((prev) => new Set(prev).add(voucherId));

    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers/${voucherId}/like`, {
        method: 'POST',
        credentials: 'include',
      });

      // 409 Conflict는 이미 좋아요한 상태이므로 무시
      if (response.status === 409) {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to like voucher');
      }

      // 로컬 상태 즉시 업데이트 (낙관적 업데이트)
      setVoucherData((prev: any) => {
        if (!prev || !Array.isArray(prev)) return prev;

        return prev.map((recommendation: any) => ({
          ...recommendation,
          vouchers: recommendation.vouchers?.map((voucher: any) =>
            voucher.id === voucherId
              ? {
                ...voucher,
                myLike: true,
                likeCnt: (voucher.likeCnt || 0) + 1,
              }
              : voucher
          ),
        }));
      });

      // 서버 동기화는 하지 않고 쿼리만 무효화 (서버 응답이 likeCnt를 제대로 반환하지 않을 수 있음)
      await queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      await queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    } catch (error) {
      console.error('좋아요 실패:', error);
      toast.error('좋아요에 실패했습니다.');

      // 에러 발생 시 낙관적 업데이트 롤백
      setVoucherData((prev: any) => {
        if (!prev || !Array.isArray(prev)) return prev;

        return prev.map((recommendation: any) => ({
          ...recommendation,
          vouchers: recommendation.vouchers?.map((voucher: any) =>
            voucher.id === voucherId
              ? {
                ...voucher,
                myLike: false,
                likeCnt: Math.max((voucher.likeCnt || 1) - 1, 0),
              }
              : voucher
          ),
        }));
      });
    } finally {
      setLikingVoucherIds((prev) => {
        const next = new Set(prev);
        next.delete(voucherId);
        return next;
      });
    }
  };

  const handleUnlike = async (voucherId: number) => {
    // 중복 클릭 방지
    if (likingVoucherIds.has(voucherId)) {
      return;
    }

    setLikingVoucherIds((prev) => new Set(prev).add(voucherId));

    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers/${voucherId}/like`, {
        method: 'DELETE',
        credentials: 'include',
      });

      // 409 Conflict는 이미 좋아요 취소한 상태이므로 무시
      if (response.status === 409) {
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to unlike voucher');
      }

      // 로컬 상태 즉시 업데이트 (낙관적 업데이트)
      setVoucherData((prev: any) => {
        if (!prev || !Array.isArray(prev)) return prev;

        return prev.map((recommendation: any) => ({
          ...recommendation,
          vouchers: recommendation.vouchers?.map((voucher: any) =>
            voucher.id === voucherId
              ? {
                ...voucher,
                myLike: false,
                likeCnt: Math.max((voucher.likeCnt || 1) - 1, 0),
              }
              : voucher
          ),
        }));
      });

      // 서버 동기화는 하지 않고 쿼리만 무효화 (서버 응답이 likeCnt를 제대로 반환하지 않을 수 있음)
      await queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    } catch (error) {
      console.error('좋아요 취소 실패:', error);
      toast.error('좋아요 취소에 실패했습니다.');

      // 에러 발생 시 낙관적 업데이트 롤백
      setVoucherData((prev: any) => {
        if (!prev || !Array.isArray(prev)) return prev;

        return prev.map((recommendation: any) => ({
          ...recommendation,
          vouchers: recommendation.vouchers?.map((voucher: any) =>
            voucher.id === voucherId
              ? {
                ...voucher,
                myLike: true,
                likeCnt: (voucher.likeCnt || 0) + 1,
              }
              : voucher
          ),
        }));
      });
    } finally {
      setLikingVoucherIds((prev) => {
        const next = new Set(prev);
        next.delete(voucherId);
        return next;
      });
    }
  };

  const hasVoucherData = voucherData && Array.isArray(voucherData) && voucherData.length > 0;
  const hasWorkoutData = workoutData && Array.isArray(workoutData) && workoutData.length > 0;

  // 캐릭터 정보 및 메시지 가져오기
  const getCharacterInfo = () => {
    if (!userInfo || !userInfo.profileImageNumber) {
      const character = FaceOptions[0]; // 기본 호랑이
      return {
        character,
        message: CharacterRecommendationMessages.TIGER,
      };
    }

    const characterIndex = userInfo.profileImageNumber - 1;
    const character = FaceOptions[characterIndex];
    const characterKey = character.name.toUpperCase() as keyof typeof CharacterRecommendationMessages;
    const message = CharacterRecommendationMessages[characterKey] || CharacterRecommendationMessages.TIGER;

    return {
      character,
      message,
    };
  };

  const { character, message } = getCharacterInfo();

  return (
    <div className="absolute top-16 bottom-16 left-0 right-0 w-full overflow-y-auto px-4 py-6 ">
      <div className="max-w-md mx-auto">
        {/* 헤더 */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <CharacterIcon
              src={character.src}
              alt={character.name}
              size={60}
              className="hover:scale-110 transition-transform duration-300"
            />
            <div className="flex-1">
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{message}</p>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('voucher')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'voucher'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            바우처 추천
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'workout'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            홈 운동 추천
          </button>
        </div>

        {/* 내용 */}
        <div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : activeTab === 'voucher' ? (
            hasVoucherData ? (
              <div className="space-y-4">
                {voucherData.map((recommendation: any) => (
                  <div key={recommendation.id} className="bg-gray-50 rounded-xl p-4">
                    {/* 날짜 */}
                    {recommendation.createdAt && (
                      <div className="text-xs text-gray-400 mb-2">
                        {new Date(recommendation.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}

                    {/* 무드 태그 */}
                    {recommendation.moodTags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recommendation.moodTags.split(',').map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 추천된 바우처 목록 */}
                    <div className="space-y-2">
                      {recommendation.vouchers && recommendation.vouchers.map((voucher: any) => (
                        <VoucherCard
                          key={voucher.id}
                          voucher={voucher}
                          onLike={handleLike}
                          onUnlike={handleUnlike}
                          isLiking={likingVoucherIds.has(voucher.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-medium mb-2">추천 기록이 없습니다</p>
                <p className="text-sm">트레이너와 대화해서 바우처를 추천받아보세요!</p>
              </div>
            )
          ) : (
            hasWorkoutData ? (
              <div className="space-y-4">
                {workoutData.map((workout: any, index: number) => (
                  <div
                    key={workout.id || index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transform transition-transform duration-300 hover:scale-[1.02] will-change-transform"
                  >
                    {/* 날짜 */}
                    {workout.createdAt && (
                      <div className="text-xs text-gray-400 mb-3">
                        {new Date(workout.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}

                    {/* 무드 태그 */}
                    {workout.moodTags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {workout.moodTags.split(',').map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 워밍업 */}
                    {workout.warmupExercises && workout.warmupExercises.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                          <FireIcon className="w-4 h-4 text-orange-500" /> 워밍업
                        </h4>
                        <ul className="space-y-1">
                          {workout.warmupExercises.map((exercise: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 pl-4">
                              • {exercise}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 메인 운동 */}
                    {workout.mainExercises && workout.mainExercises.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                          <MuscleIcon className="w-4 h-4 text-yellow-500" /> 메인 운동
                        </h4>
                        <ul className="space-y-1">
                          {workout.mainExercises.map((exercise: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 pl-4">
                              • {exercise}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 쿨다운 */}
                    {workout.coolDownExercises && workout.coolDownExercises.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                          <MeditationIcon className="w-4 h-4 text-green-500" /> 쿨다운
                        </h4>
                        <ul className="space-y-1">
                          {workout.coolDownExercises.map((exercise: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 pl-4">
                              • {exercise}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 비디오 정보 */}
                    {((workout.warmupVideos && workout.warmupVideos.length > 0) ||
                      (workout.mainVideos && workout.mainVideos.length > 0) ||
                      (workout.coolDownVideos && workout.coolDownVideos.length > 0)) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            📹 {
                              (workout.warmupVideos?.length || 0) +
                              (workout.mainVideos?.length || 0) +
                              (workout.coolDownVideos?.length || 0)
                            }개의 운동 영상이 제공되었습니다
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-medium mb-2">추천 기록이 없습니다</p>
                <p className="text-sm">트레이너와 대화해서 홈 운동을 추천받아보세요!</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationHistoryContent;

