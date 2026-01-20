import CharacterIcon from "@/components/icon/CharacterIcon";

const LoginContentLogo = () => {
    return (
        <div className="flex flex-col items-center justify-center pt-40">
            <CharacterIcon src="/characters/together.svg" size={400} />
            <h1 className="text-xl py-4">몸과 마음을 건강히, MaumFit</h1>
        </div>
    )
}

export default LoginContentLogo