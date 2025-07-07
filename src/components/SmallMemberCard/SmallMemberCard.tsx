import styles from "@/components/SmallMemberCard/SmallMemberCard.module.css"
type MemberCardProps = {
    nickname:string,
    imgUrl?: string,
    strDomain?: string;
    key?: number;
};

export const SmallMemberCard = ({nickname, imgUrl, strDomain}:MemberCardProps) => {
    return (
        <div className={styles.member}>
            {imgUrl && (
                <img src={strDomain + imgUrl} className={styles.memberImage} />
            )}
            <span className={styles.memberNickname}>{nickname}</span>
        </div>
    );
};


