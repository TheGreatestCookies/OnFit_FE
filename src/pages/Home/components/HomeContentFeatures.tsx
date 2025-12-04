import Icon from "@/components/icon/Icon";
import IconName from "@/constants/IconName";

const HomeContentFeatures = () => {
    return (
        <div className="flex items-right gap-2 absolute top-2 left-24 w-full justify-center pointer-events-auto">
            <button
                onClick={() => { }}
                className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer"
            >
                <Icon
                    src={IconName.CHAT_RECORD}
                    size={54}
                />
            </button>
            <button
                onClick={() => { }}
                className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer"
            >
                <Icon
                    src={IconName.CHARACTER_CHANGE}
                    size={54}
                />
            </button>
            <button
                onClick={() => { }}
                className="inline-block hover:scale-110 transition-transform duration-300 cursor-pointer"
            >
                <Icon
                    src={IconName.NOTICE}
                    size={54}
                />
            </button>
        </div>
    )
}
export default HomeContentFeatures