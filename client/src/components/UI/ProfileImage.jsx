export default function ProfileImage({ initials, imageUrl }) {
    if (imageUrl) {
        return (
            <img src={imageUrl} alt="profile" className="profile-image" />
        )
    } else if (initials) {
        return (
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary-100 text-secondary-400">
                <span className="text-base">{initials}</span>
            </div>
        )
    } else {
        return (
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary-100">
                <svg className="h-1/2 w-1/2 text-secondary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h1 1 14H20z"></path>
                </svg>
            </div>
        )
    }
}