export const Logo = ({ size, ...props }) => (
    <div className="flex justify-center">
        <img
            src="/icons/charusat_logo.jpg" 
            alt="Charusat_logo"
            width={size}
            {...props}
        />
    </div>
);