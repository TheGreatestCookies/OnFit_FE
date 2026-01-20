interface MuscleIconProps {
    className?: string;
}

const MuscleIcon = ({ className = 'w-5 h-5' }: MuscleIconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M12.75 3.066a2.25 2.25 0 00-4.5 0v.684a2.25 2.25 0 004.5 0v-.684zM10.5 6.75a2.25 2.25 0 00-2.25 2.25v6a2.25 2.25 0 002.25 2.25h3a2.25 2.25 0 002.25-2.25v-6a2.25 2.25 0 00-2.25-2.25h-3z" />
            <path fillRule="evenodd" d="M9.75 21a.75.75 0 01-.75-.75v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5z" clipRule="evenodd" />
            <path d="M6.75 9a.75.75 0 00-.75.75v4.5a.75.75 0 00.75.75h.75v-6h-.75zM17.25 9a.75.75 0 00-.75.75v4.5a.75.75 0 00.75.75h.75v-6h-.75z" />
        </svg>
    );
};

export default MuscleIcon;
