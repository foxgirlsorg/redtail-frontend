import styles from './DownloadCard.module.css';
import { IonIcon } from '@/components/IonIcon';

type BookFile = {
    documentId: string;
    file_type: string;
    file: { url: string; name: string }[];
};

type DownloadCardProps = {
    files: BookFile[];
    strDomain?: string;
};

const iconForType: Record<string, string> = {
    pdf:  '/icons/document-outline.svg',
    epub: '/icons/book-outline.svg',
    zip:  '/icons/archive-outline.svg',
    fb2:  '/icons/document-text-outline.svg',
};

export const DownloadCard = ({ files, strDomain }: DownloadCardProps) => {
    if (!files || files.length === 0) return null;

    const items = files.flatMap(bookFile =>
        bookFile.file.map(f => ({
            url: (strDomain ?? '') + f.url,
            name: f.name,
            type: bookFile.file_type,
        }))
    );

    if (items.length === 0) return null;

    return (
            <div className={styles.list}>
                {items.map((item, i) => (
                    <a
                        key={i}
                        href={item.url}
                        className={styles.item}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <IonIcon
                            src={iconForType[item.type] ?? '/icons/download-outline.svg'}
                            className={styles.icon}
                        />
                        <span className={styles.badge}>{item.type}</span>
                    </a>
                ))}
            </div>

    );
};