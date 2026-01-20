import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { ROUTE_PATH } from '@/constants/RoutePath';
import LoginContentLogo from './LoginContentLogo';

const LoginContent = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            await login({ email, password });
            const continueUrl = searchParams.get('continue');
            if (continueUrl) {
                navigate(continueUrl);
            } else {
                navigate(ROUTE_PATH.HOME); // Or home
            }
        } catch {
            toast.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }
    };

    return (

        <>
            <LoginContentLogo />
            <div className="flex flex-col items-center justify-center flex-1 px-6 pt-12">

                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4" noValidate>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-2/3 mx-auto px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-2/3 mx-auto px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                    />

                    <button
                        type="submit"
                        className="w-2/3 mx-auto bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
                    >
                        로그인
                    </button>
                </form>
                <div className="mt-6">
                    <button
                        onClick={() => navigate(ROUTE_PATH.SIGNUP)}
                        className="text-gray-500 hover:text-gray-700 underline"
                    >
                        회원가입
                    </button>
                </div>
            </div>
        </>
    );
};

export default LoginContent;
