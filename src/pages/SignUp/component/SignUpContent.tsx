import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { ROUTE_PATH } from '@/constants/RoutePath';
import LoginContentLogo from '@/pages/Login/component/LoginContentLogo';

const SignUpContent = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !name) {
            toast.error('모든 필드를 입력해주세요.');
            return;
        }

        if (!email.includes('@')) {
            toast.error('이메일 형식이 올바르지 않습니다.');
            return;
        }

        try {
            // profileImageNumber is hardcoded for now as per simple implementation
            await signup({ email, password, name, profileImageNumber: 1 });
            toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
            navigate(ROUTE_PATH.LOGIN);
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('회원가입에 실패했습니다. 다시 시도해주세요.');
            }
        }
    };

    return (<>
        <LoginContentLogo />
        <div className="flex flex-col items-center justify-center flex-1 px-6 ">

            <h1 className="text-2xl font-bold mb-8">회원가입</h1>
            <form onSubmit={handleSignup} className="w-full max-w-sm flex flex-col gap-4" noValidate>
                <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-2/3 mx-auto px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                    required
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-2/3 mx-auto px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                    required
                />
                <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-2/3 mx-auto px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                    required
                />

                <button
                    type="submit"
                    className="w-2/3 mx-auto bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
                >
                    가입하기
                </button>
            </form>
        </div>
    </>
    );

};

export default SignUpContent;
