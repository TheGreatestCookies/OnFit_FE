interface LoadingSpinnerProps {
    message?: string;
    description?: string;
    className?: string;
}

const LoadingSpinner = ({ message = '로딩 중...', description, className = '' }: LoadingSpinnerProps) => {
    return (
        <div className={`flex items-center justify-center h-full ${className}`}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                <div className="text-gray-600 font-medium whitespace-pre-line">
                    {message}
                </div>
                {description && <p className="text-sm text-gray-400 mt-2 whitespace-pre-line">{description}</p>}
            </div>
        </div>
    );
};

export default LoadingSpinner;
