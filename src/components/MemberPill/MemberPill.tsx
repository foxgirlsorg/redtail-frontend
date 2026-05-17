import styles from "@/components/MemberPill/MemberPill.module.css"

type MemberCardProps = {
    nickname:string,
    imgUrl?: string,
    strDomain?: string;
    url?: string;
    key?: number;
};

export const MemberPill = ({nickname, imgUrl, url, strDomain}:MemberCardProps) => {

    const className = imgUrl ? styles.pill:`${styles.pill} ${styles.nopfp}`;

    const content = (
        <>
            {imgUrl && (
                <img src={strDomain + imgUrl} className={styles.pillImage} />
            )}
            <span className={styles.memberNickname}>{nickname}</span>
        </>
    );

    return url ? (
        <a
            href={url}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
        >
            {content}
        </a>
    ) : (
        <div className={className}>
            {content}
        </div>
    );
};