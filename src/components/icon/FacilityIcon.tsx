interface FacilityIconProps {
    className?: string;
}

const FacilityIcon = ({ className = "w-5 h-5" }: FacilityIconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path fillRule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054A8.25 8.25 0 0018 4.524l3.11-.732a.75.75 0 01.917.81 47.784 47.784 0 00.005 10.337.75.75 0 01-.574.812l-3.114.733a9.75 9.75 0 01-6.594-.77l-.108-.054a8.25 8.25 0 00-5.69-.625l-2.25.563A.75.75 0 013 14.893V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
            <path d="M3 17.25a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v3a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-3z" />
        </svg>
    );
};

export default FacilityIcon;
