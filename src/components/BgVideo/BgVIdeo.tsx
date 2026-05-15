'use client';

export const BgVideo = ({ src, poster, className }: { src: string; poster?: string; className?: string }) => (
    <video
        className={className}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        onEnded={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play();
        }}
    />
);